"""Read the player's rendered controls and recent trusted inputs when a CI check fails."""
import json


# Store only the last eight inputs within this test page. The listener never cancels,
# forwards or synthesises an event and does not write to game state or browser storage.
LISTEN = """(() => {
  const inputs = [];
  document.addEventListener('click', event => {
    const button = event.target.closest?.('button');
    inputs.push({time:Math.round(performance.now()), trusted:event.isTrusted, x:event.clientX,y:event.clientY,
      control:button ? {id:button.id, data:{...button.dataset}, label:button.getAttribute('aria-label')} : null,
      selected:document.querySelector('[data-item][aria-pressed="true"]')?.dataset.item ?? null,
      mode:document.querySelector('#command-dock')?.dataset.mode ?? null,
      modal:document.querySelector('dialog[open]')?.id ?? null});
    if(inputs.length>8) inputs.shift();
  }, {capture:true,passive:true});
  window.qaRecentInputs = () => inputs.slice();
})();"""


def failure_view(page):
    return page.evaluate("""() => {
      const by=id=>document.getElementById(id);
      const saved=JSON.parse(localStorage.getItem('castaways-adventure-v4')) || {};
      const hint=saved.scene && window.AdventureEngine?.hint(saved);
      const target=hint && document.querySelector('[data-target="'+CSS.escape(hint.targetId)+'"]');
      const name=node=>node && (node.getAttribute('aria-label') || node.id || node.tagName);
      const describe=node=>node && ({id:node.id,data:{...node.dataset},label:name(node),hidden:node.hidden,
                                     disabled:node.disabled,inert:Boolean(node.closest('[inert]'))});
      let expected=null;
      if(target){
        const r=target.getBoundingClientRect(), x=r.x+r.width/2, y=r.y+r.height/2;
        expected={...describe(target),center:[x,y],onScreen:target.checkVisibility({checkVisibilityCSS:true}),
          hitStack:document.elementsFromPoint(x,y).slice(0,5).map(node=>name(node.closest('button')||node))};
      }
      return {chapter:saved.chapter,scene:saved.scene,actions:saved.actions,inventory:saved.inventory,
        flags:Object.keys(saved.flags||{}).filter(k=>saved.flags[k]),lastEntries:saved.log?.slice(-3),
        nextHint:hint && {target:hint.targetId,item:hint.itemId,scene:hint.sceneId},expected,
        selected:document.querySelector('[data-item][aria-pressed="true"]')?.dataset.item ?? null,
        actionLabel:by('action-label')?.textContent,caption:by('caption')?.textContent,
        cancel:describe(by('cancel-item')),inspect:by('inspect-mode')?.getAttribute('aria-pressed'),
        focus:describe(document.activeElement),dialogs:[...document.querySelectorAll('dialog[open]')].map(describe),
        loading:{open:by('scene-loading')?.open,phase:by('scene-loading')?.dataset.phase,message:by('scene-load-message')?.textContent},
        workbench:describe(by('workbench')),dialogue:{hidden:by('dialogue')?.hidden,mode:by('command-dock')?.dataset.mode,
          speaker:by('dialogue-speaker')?.textContent,text:by('dialogue-text')?.textContent},
        player:{classes:by('player')?.className,moving:by('player-sprite')?.dataset.moving,
          foot:[by('player')?.style.left,by('player')?.style.top]},
        painting:by('backdrop')?.dataset.painting,documentHidden:document.hidden,networkOnline:navigator.onLine,
        recentInputs:window.qaRecentInputs?.()};
    }""")


def print_snapshot(snapshot):
    print('Player UI at failure: '+json.dumps(snapshot, ensure_ascii=False), flush=True)
