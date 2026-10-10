import type { Direction } from "../../src/index.js";
export const PAD_DIRECTIONS: readonly Direction[] = ["n","ne","e","se","s","sw","w","nw"];
const labels: Record<Direction,string> = {n:"북",ne:"북동",e:"동",se:"남동",s:"남",sw:"남서",w:"서",nw:"북서"};
const arrows: Record<Direction,string> = {n:"↑",ne:"↗",e:"→",se:"↘",s:"↓",sw:"↙",w:"←",nw:"↖"};
/** Coordinates normalized to pad radius. Center and releases outside the pad cancel. */
export function padDirection(x: number, y: number): Direction | null {
  const distance = Math.hypot(x,y);
  if (distance < .28 || distance > 1.08) return null;
  const index = (Math.round(Math.atan2(x,-y) / (Math.PI / 4)) + 8) % 8;
  return PAD_DIRECTIONS[index]!;
}
export function thumbPad(move: (direction: Direction) => void): { element: HTMLElement; cancel: () => void } {
  const pad = document.createElement("div"); pad.className = "pad thumb-pad"; pad.tabIndex = 0;
  pad.setAttribute("role","group"); pad.setAttribute("aria-label","8방향 이동 · 밀고 놓으면 한 칸 · 중앙은 취소");
  let pointer: number | null = null, direction: Direction | null = null;
  const controls = new Map<Direction,HTMLButtonElement>();
  for (const d of PAD_DIRECTIONS) {
    const button = document.createElement("button"); button.type = "button"; button.textContent = arrows[d]; button.dataset.direction = d;
    button.setAttribute("aria-label",labels[d]+"쪽 이동"); button.className = "pad-" + d;
    // Keyboard/assistive activation has no pointer sequence. Pointer release is handled once by the pad.
    button.addEventListener("click",event=>{ if(event.detail===0) move(d); });
    pad.append(button); controls.set(d,button);
  }
  const center = document.createElement("button"); center.type = "button"; center.className = "pad-center";
  center.textContent = "취소"; center.setAttribute("aria-label","이동 취소 · 턴 소비 없음"); pad.append(center);
  const show = (next: Direction | null): void => { direction=next; pad.dataset.direction=next??"cancel"; for(const [d,b] of controls) b.classList.toggle("held",d===next); };
  const cancel = (): void => { const id=pointer; pointer=null; show(null); if(id!==null && pad.hasPointerCapture(id)) pad.releasePointerCapture(id); };
  const update = (event: PointerEvent): void => { const r=pad.getBoundingClientRect(); show(padDirection((event.clientX-r.left-r.width/2)/(r.width/2),(event.clientY-r.top-r.height/2)/(r.height/2))); };
  pad.addEventListener("pointerdown",event=>{ if(pointer!==null || event.button!==0 || !event.isPrimary)return; event.preventDefault(); pointer=event.pointerId; pad.setPointerCapture(pointer); update(event); });
  pad.addEventListener("pointermove",event=>{if(event.pointerId===pointer) update(event);});
  pad.addEventListener("pointerup",event=>{ if(event.pointerId!==pointer)return; update(event); const chosen=direction; cancel(); if(chosen)move(chosen); });
  pad.addEventListener("pointercancel",event=>{if(event.pointerId===pointer)cancel();});
  pad.addEventListener("lostpointercapture",()=>{pointer=null;show(null);});
  center.addEventListener("click",cancel);
  pad.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();cancel();}});
  pad.addEventListener("blur",cancel,true);
  return {element:pad,cancel};
}
