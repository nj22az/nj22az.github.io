function alias(clips, from, to){
  const src=clips.find(c=>c.name===from);
  if(!src||clips.some(c=>c.name===to))return;
  const copy=src.clone();copy.name=to;clips.push(copy);
}

// Studio Mixamo clips (Idle / Walk / Wave / SitCube) mapped onto the town action names.
export function prepareAyaAnimations(gltf){
  const clips=gltf.animations||[];
  alias(clips,'Idle','Idle_Neutral');
  alias(clips,'SitCube','Sit');
  alias(clips,'Walk','Run');
  return clips;
}
