const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
// Upgrade only our own launcher; portable archives and unrelated shortcuts stay untouched.
function syncDesktopIcon({installRoot,home=os.homedir(),dataHome=process.env.XDG_DATA_HOME||path.join(home,'.local/share')}){
 if(!installRoot||!fs.existsSync(path.join(installRoot,'.johansson-world-install')))return false;
 const desktop=path.join(dataHome,'applications/johansson-world.desktop');
 const icon=path.join(installRoot,'current/resources/app/site/desktop/icons/johansson-world-512.png');
 if(!fs.existsSync(desktop)||!fs.existsSync(icon))return false;
 const content=fs.readFileSync(desktop,'utf8');
 const exec=content.split('\n').find(line=>line.startsWith('Exec='));
 if(!exec?.includes('/.local/bin/johansson-world')||!content.includes('Name=Johansson World\n'))return false;
 if(/[\r\n]/.test(icon))return false;
 const next=content.replace(/^Icon=.*\n/gm,'').replace('[Desktop Entry]\n','[Desktop Entry]\nIcon='+icon+'\n');
 if(next===content)return false;
 const temporary=desktop+'.icon-next';fs.writeFileSync(temporary,next,{mode:0o755});fs.renameSync(temporary,desktop);return true;
}
module.exports={syncDesktopIcon};
