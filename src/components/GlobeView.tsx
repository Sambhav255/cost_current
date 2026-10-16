import { useEffect, useMemo, useRef, useState } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import { MeshPhongMaterial, Color } from 'three';
import { countries } from '../lib/geography';
import type { Route } from '../lib/types';
export default function GlobeView({routes,selected,onSelect,reduced}:{routes:Route[];selected:string;onSelect:(id:string)=>void;reduced:boolean}) {
 const wrapper=useRef<HTMLDivElement>(null), globe=useRef<GlobeMethods|undefined>(undefined);
 const [size,setSize]=useState({width:650,height:500});
 const [ready,setReady]=useState(false);
 const material=useMemo(()=>new MeshPhongMaterial({color:new Color('#101e24'),shininess:7,emissive:new Color('#050b0d')}),[]);
 const points=useMemo(()=>routes.flatMap(r=>[{lat:r.startLat,lng:r.startLng,name:r.origin,routeId:r.id},{lat:r.endLat,lng:r.endLng,name:r.destination,routeId:r.id}]),[routes]);
 useEffect(()=>{const el=wrapper.current;if(!el)return;const observer=new ResizeObserver(([entry])=>setSize({width:entry.contentRect.width,height:entry.contentRect.height}));observer.observe(el);return()=>observer.disconnect();},[]);
 useEffect(()=>{if(!ready||!globe.current)return;const g=globe.current;g.controls().autoRotate=false;g.controls().enablePan=false;g.controls().minDistance=160;g.controls().maxDistance=700;g.renderer().setPixelRatio(Math.min(window.devicePixelRatio,1.5));const route=routes.find(r=>r.id===selected)!;const lng=route.startLng>90?-165:route.startLng<30?-30:-130;g.pointOfView({lat:24,lng,altitude:1.8},reduced?0:850);},[selected,ready,reduced,routes]);
 useEffect(()=>()=>material.dispose(),[material]);
 return <div className="globe-canvas" ref={wrapper} data-testid="interactive-globe"><Globe ref={globe} width={size.width} height={size.height} backgroundColor="rgba(0,0,0,0)" globeMaterial={material} showAtmosphere atmosphereColor="#618c80" atmosphereAltitude={.11} showGraticules polygonsData={countries} polygonCapColor={()=> '#243e40'} polygonSideColor={()=> '#152c30'} polygonStrokeColor={()=> '#456160'} polygonAltitude={.003} polygonsTransitionDuration={0} arcsData={routes} arcStartLat="startLat" arcStartLng="startLng" arcEndLat="endLat" arcEndLng="endLng" arcColor={(o: object)=>(o as Route).id===selected?'#c1f894':'#68999f'} arcStroke={o=>(o as Route).id===selected?.6:.25} arcAltitude={.18} arcDashLength={reduced?1:.55} arcDashGap={reduced?0:.18} arcDashAnimateTime={reduced?0:6500} arcsTransitionDuration={0} arcLabel={()=>''} onArcClick={o=>onSelect((o as Route).id)} pointsData={points} pointLat="lat" pointLng="lng" pointRadius={.35} pointAltitude={.008} pointColor={()=> '#c1f894'} pointsTransitionDuration={0} onPointClick={o=>onSelect((o as {routeId:string}).routeId)} labelsData={points} labelLat="lat" labelLng="lng" labelText="name" labelSize={1.1} labelDotRadius={.15} labelColor={()=> '#d1e6d7'} labelAltitude={.03} labelResolution={2} onGlobeReady={()=>setReady(true)} enablePointerInteraction animateIn={false}/></div>;
}
