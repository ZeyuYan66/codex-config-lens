---
name: tf2-transforms
description: 'Work with ROS 2 TF2 transforms. Use when broadcasting, listening, or looking up transforms between coordinate frames.'
---

<!--
SPDX-FileCopyrightText: 2026 Michael Wimble
SPDX-License-Identifier: Apache-2.0
-->
<!-- Local adaptation 2026-10-05: moved YAML metadata to the file start for Codex skill discovery; upstream guidance is unchanged. -->


# Role
You are an expert in the ROS 2 TF2 transform system. You guide correct usage of transform broadcasting, listening, frame conventions, and debugging transform issues in ROS 2 Jazzy/Rolling.

## Frame Convention (REP 105)
```
map → odom → base_link → [sensor frames]
```
- **map**: Global fixed frame, corrected by SLAM/localization. May jump.
- **odom**: Continuous odometry frame. Smooth but drifts over time.
- **base_link**: Rigidly attached to the robot body center.
- **base_footprint**: Projection of base_link onto the ground plane (optional).
- Sensor frames: `camera_link`, `lidar_link`, `imu_link`, etc.

The `map→odom` transform is published by localization (AMCL, robot_localization). The `odom→base_link` transform is published by odometry (wheel encoders, visual odom).

## Static Transform Broadcaster (Python)
```python
import rclpy
from rclpy.node import Node
from tf2_ros import StaticTransformBroadcaster
from geometry_msgs.msg import TransformStamped

class StaticTFPublisher(Node):
    def __init__(self):
        super().__init__('static_tf_pub')
        self.broadcaster = StaticTransformBroadcaster(self)

        t = TransformStamped()
        t.header.stamp = self.get_clock().now().to_msg()
        t.header.frame_id = 'base_link'
        t.child_frame_id = 'lidar_link'
        t.transform.translation.x = 0.1
        t.transform.translation.y = 0.0
        t.transform.translation.z = 0.25
        t.transform.rotation.w = 1.0  # identity quaternion

        self.broadcaster.sendTransform(t)
```

## Static Transform in Launch File
```python
from launch_ros.actions import Node

Node(
    package='tf2_ros',
    executable='static_transform_publisher',
    arguments=['--x', '0.1', '--y', '0', '--z', '0.25',
               '--roll', '0', '--pitch', '0', '--yaw', '0',
               '--frame-id', 'base_link', '--child-frame-id', 'lidar_link'],
)
```

## Dynamic Transform Broadcaster (Python)
```python
from tf2_ros import TransformBroadcaster

class OdomPublisher(Node):
    def __init__(self):
        super().__init__('odom_pub')
        self.tf_broadcaster = TransformBroadcaster(self)
        self.timer = self.create_timer(0.02, self.publish_odom)  # 50 Hz

    def publish_odom(self):
        t = TransformStamped()
        t.header.stamp = self.get_clock().now().to_msg()
        t.header.frame_id = 'odom'
        t.child_frame_id = 'base_link'
        t.transform.translation.x = self.x
        t.transform.translation.y = self.y
        t.transform.rotation.z = sin(self.theta / 2)
        t.transform.rotation.w = cos(self.theta / 2)
        self.tf_broadcaster.sendTransform(t)
```

## Transform Listener (Python)
```python
from tf2_ros import TransformException
from tf2_ros.buffer import Buffer
from tf2_ros.transform_listener import TransformListener

class TFListenerNode(Node):
    def __init__(self):
        super().__init__('tf_listener')
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self)
        self.timer = self.create_timer(0.1, self.on_timer)

    def on_timer(self):
        try:
            # Get latest transform with up to 1 second wait
            t = self.tf_buffer.lookup_transform(
                'map', 'base_link',
                rclpy.time.Time(),  # Time(0) = latest available
                timeout=rclpy.duration.Duration(seconds=1.0)
            )
            self.get_logger().info(
                f'Position: x={t.transform.translation.x:.2f}, '
                f'y={t.transform.translation.y:.2f}')
        except TransformException as ex:
            self.get_logger().warn(f'Could not get transform: {ex}')
```

## C++ Transform Listener
```cpp
#include "tf2_ros/buffer.h"
#include "tf2_ros/transform_listener.h"

class TFNode : public rclcpp::Node {
  std::shared_ptr<tf2_ros::Buffer> tf_buffer_;
  std::shared_ptr<tf2_ros::TransformListener> tf_listener_;

public:
  TFNode() : Node("tf_node") {
    tf_buffer_ = std::make_shared<tf2_ros::Buffer>(this->get_clock());
    tf_listener_ = std::make_shared<tf2_ros::TransformListener>(*tf_buffer_);
  }

  void lookup() {
    try {
      auto t = tf_buffer_->lookupTransform("map", "base_link", tf2::TimePointZero);
    } catch (const tf2::TransformException &ex) {
      RCLCPP_WARN(get_logger(), "TF error: %s", ex.what());
    }
  }
};
```

## Transforming Stamped Messages
```python
import tf2_geometry_msgs  # MUST import this for PointStamped transforms
from geometry_msgs.msg import PointStamped

point_in_lidar = PointStamped()
point_in_lidar.header.frame_id = 'lidar_link'
point_in_lidar.header.stamp = self.get_clock().now().to_msg()
point_in_lidar.point.x = 1.0

# Transform to map frame
point_in_map = self.tf_buffer.transform(point_in_lidar, 'map', timeout=Duration(seconds=0.5))
```

## Debugging TF
```bash
# View full TF tree
ros2 run tf2_tools view_frames
# Produces frames.pdf

# Echo a specific transform
ros2 run tf2_ros tf2_echo map base_link

# Monitor TF for issues
ros2 run tf2_ros tf2_monitor
```

## Critical Warnings
- **Time(0) vs now()**: `Time(0)` / `tf2::TimePointZero` means "latest available transform." Using `now()` requires the exact timestamp to exist in the buffer, which often fails. Prefer `Time(0)` for most lookups.
- **ExtrapolationException**: This happens when you request a transform at a time outside the buffer's range. Common causes: (1) sim_time not enabled, (2) clock skew, (3) transform publisher stopped.
- **Buffer size**: Default buffer holds 10 seconds of transforms. For slow transforms, increase buffer cache time.
- **tf2_geometry_msgs import**: In Python, you MUST `import tf2_geometry_msgs` before calling `buffer.transform()` on geometry_msgs types. Without it, you get `TypeException: Type PointStamped not loadable`.
- **Static vs dynamic**: Use `StaticTransformBroadcaster` for fixed transforms (sensor mounts). It publishes on `/tf_static` with TRANSIENT_LOCAL QoS so late-joiners get it. Never publish static transforms on `/tf`.
- **One publisher per transform**: Only ONE node should publish a given parent→child transform. Multiple publishers cause flickering.
- **Quaternion normalization**: Quaternion (x,y,z,w) must be normalized. An identity rotation is `(0,0,0,1)`, NOT `(0,0,0,0)`.
