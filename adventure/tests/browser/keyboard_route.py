"""Exercise keyboard focus through the first two pickups and the crafting result."""
import json

from playwright.sync_api import expect

from campaign import item, state, target


def tab_to(page, control):
    expect(control).to_be_visible()
    total = page.locator('button, a[href], summary, [tabindex]').count()
    for tabs in range(total + 3):
        if control.evaluate("el => el === document.activeElement"):
            return tabs
        page.keyboard.press('Tab')
    raise AssertionError(f'Tab did not reach {control}')


def keyboard_ready(page):
    page.wait_for_function("document.querySelector('#backdrop img')?.naturalWidth > 0")
    page.locator('#scene-loading').wait_for(state='hidden')
    for name in ('dialogue-close', 'chapter-banner-close', 'dismiss-hint'):
        control = page.locator(f'#{name}')
        if control.is_visible():
            tab_to(page, control)
            page.keyboard.press('Enter')


def visible_focus(control):
    expect(control).to_be_focused(timeout=15000)
    focus = control.evaluate("""el => {
      const style=getComputedStyle(el), rect=el.getBoundingClientRect();
      return {item:el.dataset.item, target:el.dataset.target, label:el.getAttribute('aria-label')||el.textContent,
        focusVisible:el.matches(':focus-visible'), outlineWidth:parseFloat(style.outlineWidth),
        outlineStyle:style.outlineStyle, shadow:style.boxShadow,
        onScreen:rect.width>0 && rect.height>0 && rect.bottom>0 && rect.top<innerHeight &&
                 rect.right>0 && rect.left<innerWidth && el.checkVisibility({checkVisibilityCSS:true})};
    }""")
    assert focus['onScreen'] and focus['focusVisible'], focus
    assert (focus['outlineWidth'] > 0 and focus['outlineStyle'] not in ('none','hidden')) or focus['shadow'] != 'none', focus
    return focus


def keyboard_beach(page, folder):
    focused = []
    assert state(page)['inventory'] == []
    for name in ('rope', 'pole'):
        tabs = tab_to(page, target(page, name))
        page.keyboard.press('Enter')
        picked = item(page, name)
        focused.append({**visible_focus(picked), 'tabsToPickup':tabs})
        expect(target(page, name)).to_have_count(0)
    tab_to(page, item(page, 'rope'))
    page.keyboard.press('Enter')
    expect(item(page, 'rope')).to_have_attribute('aria-pressed', 'true')
    assert tab_to(page, item(page, 'pole')) > 0
    page.keyboard.press('Enter')
    tool = item(page, 'loopPole')
    focused.append(visible_focus(tool))
    saved = state(page)
    assert saved['actions'] == 3 and saved['inventory'] == ['loopPole']
    page.screenshot(path=folder / 'combined-tool-focus.png')

    page.keyboard.press('Tab')
    following = page.locator(':focus')
    expect(following).to_have_count(1)
    assert not tool.evaluate("el => el === document.activeElement")
    next_focus = visible_focus(following)

    page.reload()
    keyboard_ready(page)
    assert state(page) == saved
    expect(target(page, 'rope')).to_have_count(0)
    expect(target(page, 'pole')).to_have_count(0)
    tab_to(page, tool)
    restored = visible_focus(tool)
    result = {'pickupsAndCombination':focused, 'nextTab':next_focus, 'restored':restored, 'inventory':saved['inventory']}
    (folder / 'keyboard-route.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print(f"Keyboard transfer: rope → pole → loopPole; next Tab: {next_focus['label']}; restored loopPole.", flush=True)
