/* Audio-thread CW detector. No dependencies or per-sample allocations.
   Quadrature translation + 2 cascaded 2-pole Butterworth LPFs per I/Q arm.
   This has substantially less decision lag than a narrow 8 ms windowed Goertzel
   plus its window endpoint delay, and permits sub-block timestamped edges.
   Browser / device scheduling latency remains outside application control. */
const ToneDetectorBase = typeof AudioWorkletProcessor === 'undefined'
 ? class {constructor(){this.port={onmessage:null,postMessage:()=>{}}}}
 : AudioWorkletProcessor;
class ToneDetectorProcessor extends ToneDetectorBase {
 constructor(){super();this.nominal=650;this.freq=650;this.phase=0;this.dot=66.67;this.enabled=true;this.leak=0;this.floor=0.00005;this.peak=0.0003;this.signalLevel=0;this.noiseAge=0;this.warmupRemaining=Math.ceil(sampleRate*.3);this.lastEnv=0;this.on=false;this.candidate=0;this.candidateFrame=0;this.minHold=0.0025*sampleRate;this.displayPeriod=Math.max(1,Math.round(sampleRate/60));this.displayCount=0;this.pllPrior=0;this.pllCount=0;this.pllAccum=0;this.histI=new Float64Array(8);this.histQ=new Float64Array(8);this.edgeMsg={type:'edge',on:false,frame:0,level:0,threshold:0};this.levelMsg={type:'level',frame:0,env:0,threshold:0,floor:0,peak:0,lockedHz:650,on:false};this.setCutoff(76);
 this.port.onmessage=e=>{const m=e.data||{};if(m.type==='config'){if(Number.isFinite(m.freq)){this.nominal=Math.min(1200,Math.max(300,m.freq));this.freq=this.nominal;this.levelMsg.lockedHz=this.freq;this.phase=0;this.histI.fill(0);this.histQ.fill(0);this.floor=0.00005;this.peak=0.0003;this.signalLevel=0;this.noiseAge=0;this.warmupRemaining=Math.ceil(sampleRate*.3);this.on=false;this.candidate=0;this.pllPrior=0;this.pllCount=0;this.pllAccum=0}if(Number.isFinite(m.dot))this.dot=m.dot;if(Number.isFinite(m.leak))this.leak=Math.max(0,m.leak);if(Number.isFinite(m.signalLevel)&&m.signalLevel>=0)this.signalLevel=m.signalLevel;if(typeof m.enabled==='boolean'){if(m.enabled&&!this.enabled)this.warmupRemaining=Math.ceil(sampleRate*.3);this.enabled=m.enabled;if(!this.enabled){this.on=false;this.candidate=0}}if(Number.isFinite(m.cutoff))this.setCutoff(Math.min(90,Math.max(50,m.cutoff)))}else if(m.type==='reset'){this.on=false;this.candidate=0;this.floor=0.00005;this.peak=0.0003;this.signalLevel=0;this.noiseAge=0;this.warmupRemaining=Math.ceil(sampleRate*.3);this.histI.fill(0);this.histQ.fill(0)}};
 }
 setCutoff(cutoff){const omega=2*Math.PI*cutoff/sampleRate,co=Math.cos(omega),si=Math.sin(omega),q=Math.SQRT1_2,alpha=si/(2*q),a0=1+alpha;this.b0=((1-co)/2)/a0;this.b1=(1-co)/a0;this.b2=this.b0;this.a1=(-2*co)/a0;this.a2=(1-alpha)/a0}
 biquad(x,h,offset){let y=this.b0*x+h[offset],z1=this.b1*x-this.a1*y+h[offset+1],z2=this.b2*x-this.a2*y;h[offset]=z1;h[offset+1]=z2;return y}
 process(inputs,outputs){const input=inputs[0]?.[0],out=outputs[0];if(out)for(let c=0;c<out.length;c++)out[c].fill(0);if(!input)return true;let ph=this.phase,freq=this.freq,env=0,thr=0,floor=this.floor,peak=this.peak,candidate=this.candidate,cf=this.candidateFrame,ison=this.on;const twoPi=2*Math.PI,limit=twoPi,base=currentFrame,stable=Math.max(1,Math.min(this.minHold,0.30*this.dot/1000*sampleRate));
 for(let i=0;i<input.length;i++){let sample=input[i];ph+=twoPi*freq/sampleRate;if(ph>=limit)ph-=limit;const I=sample*Math.cos(ph)*2,Q=-sample*Math.sin(ph)*2;const ii=this.biquad(this.biquad(I,this.histI,0),this.histI,2),qq=this.biquad(this.biquad(Q,this.histQ,0),this.histQ,2);env=Math.sqrt(ii*ii+qq*qq);
 // First 300 ms after start/tuning/reset: estimate idle noise quickly, no
 // edges. This also prevents the stale fixed initial floor from locking onto
 // start-up transients. After warm-up the v1.1 steady-state DSP is unchanged.
 if(this.warmupRemaining>0){
  const fast=1-Math.exp(-1/(sampleRate*.035));
  floor+=fast*(env-floor);
  peak=Math.max(floor*6,this.signalLevel*.30);
  ison=false;candidate=0;this.warmupRemaining--;
  if(++this.displayCount>=this.displayPeriod){this.displayCount=0;this.levelMsg.frame=base+i;this.levelMsg.env=env;this.levelMsg.threshold=floor*4;this.levelMsg.floor=floor;this.levelMsg.peak=peak;this.levelMsg.lockedHz=freq;this.levelMsg.on=false;this.port.postMessage(this.levelMsg)}
  continue;
 }
 // Genuine idle envelope mean, not a deep lower percentile. One-second EMA.
 // Freeze the noise estimator during a signal, so the carrier never raises it.
 const floorMin=Math.max(0.000003,floor);
 const peakMin=Math.max(floorMin*6,this.signalLevel*0.3);
 let referencePeak=Math.max(peak,peakMin);
 let hi=Math.max(floorMin*4,floorMin+.50*(referencePeak-floorMin),this.leak*1.4);
 let lo=Math.max(floorMin*2.5,floorMin+.30*(referencePeak-floorMin),this.leak*1.1);
 if(!ison && env<hi){const a=1-Math.exp(-1/sampleRate);floor+=a*(env-floor)}
 // Decay only towards a real carrier reference; with no calibration the six-fold
 // noise guard keeps the threshold above plausible random peaks.
 if(ison && env>peak)peak+=.055*(env-peak);
 else peak+=(env>peak?.02:1/(sampleRate*2))*(env-peak);
 if(peak<Math.max(floor*6,this.signalLevel*.30))peak=Math.max(floor*6,this.signalLevel*.30);
 hi=Math.max(floor*4,floor+.50*(peak-floor),this.leak*1.4);
 lo=Math.max(floor*2.5,floor+.30*(peak-floor),this.leak*1.1);
 thr=ison?lo:hi;const want=ison?env>lo:env>hi;
 if(want===ison){candidate=0}else{if(!candidate){candidate=1;cf=base+i}else candidate++;if(candidate>=stable){ison=want;candidate=0;this.edgeMsg.on=ison;this.edgeMsg.frame=cf;this.edgeMsg.level=env;this.edgeMsg.threshold=thr;if(this.enabled)this.port.postMessage(this.edgeMsg)}}
 // Very slow bounded residual-frequency tracking, gated by reliable carrier.
 if(ison&&env>floor*5){this.pllCount++;if(this.pllCount>=Math.max(1,Math.round(sampleRate/100))){const angle=Math.atan2(qq,ii);if(this.pllPrior!==0){let delta=angle-this.pllPrior;while(delta>Math.PI)delta-=twoPi;while(delta< -Math.PI)delta+=twoPi;const residual=delta*100/twoPi;if(Math.abs(residual)<55){freq=Math.max(this.nominal-50,Math.min(this.nominal+50,freq+0.012*residual))}}this.pllPrior=angle;this.pllCount=0}}else{this.pllPrior=0;this.pllCount=0}
 if(++this.displayCount>=this.displayPeriod){this.displayCount=0;this.levelMsg.frame=base+i;this.levelMsg.env=env;this.levelMsg.threshold=thr;this.levelMsg.floor=floor;this.levelMsg.peak=peak;this.levelMsg.lockedHz=freq;this.levelMsg.on=ison;this.port.postMessage(this.levelMsg)}
 }
 this.phase=ph;this.freq=freq;this.floor=floor;this.peak=peak;this.candidate=candidate;this.candidateFrame=cf;this.on=ison;this.lastEnv=env;return true}
}
if(typeof registerProcessor==='function')registerProcessor('tone-detector',ToneDetectorProcessor);
// Export the identical processor for a deterministic main-thread test fallback
// in Chrome variants without OfflineAudioContext.audioWorklet.
export { ToneDetectorProcessor };
