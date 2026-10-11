const mode = process.argv[2];
if(mode==='hang') setInterval(()=>{},1000);
else if(mode==='overflow') { process.stdout.write('x'.repeat(8192)); setInterval(()=>{},1000); }
else { process.stdout.write(JSON.stringify({schemaVersion:1,codexVersion:'0.144.5',checks:{installation:{id:'installation',status:'failed',summary:'fake-secret'}}})); process.exitCode=1; }
