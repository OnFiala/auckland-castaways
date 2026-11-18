"""Reach both men and mark the landing before delivering the supplies."""
import json
import re

from playwright.sync_api import expect

from campaign import READ, close_if_shown, item, ready, state, target


def reunion_step(page, before, activate, folder, report):
    flags = before['flags']
    if before['scene'] != 'landing' or not flags['boatMoored']:
        return False
    rail = page.locator('#dialogue')

    def save_report():
        (folder / 'reunion-order.json').write_text(json.dumps(report, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')

    def act(control, condition):
        activate(control)
        page.wait_for_function(f"({READ}){condition}")
        ready(page)

    if not flags['rescueProvisionsTaken'] and 'beforeSupplies' not in report:
        act(target(page, 'lantern'), '.flags.lanternTaken')
        item(page, 'lantern').click()
        act(target(page, 'signalPost'), '.flags.landingMarked')
        act(page.locator('[data-exit="exit_return_camp"]'), ".scene === 'return_camp'")
        for person in ('henry', 'george'):
            act(target(page, person), f'.flags.{person}Found')
        act(page.locator('[data-exit="exit_landing"]'), ".scene === 'landing'")
        on_shore = state(page)
        assert on_shore['flags']['henryFound'] and on_shore['flags']['georgeFound']
        assert not on_shore['flags']['rescueProvisionsTaken'] and not on_shore['flags']['suppliesShared']
        activate(target(page, 'rescueBoat'))
        expect(rail).to_be_visible(timeout=15000)
        expect(rail.locator('#dialogue-text')).to_contain_text(re.compile(r'provisions', re.I))
        expect(rail).to_have_attribute('data-speaker', 'musgrave')
        assert state(page) == on_shore
        report['beforeSupplies'] = {'line':rail.locator('#dialogue-text').inner_text(), 'actions':on_shore['actions']}
        save_report()
        page.screenshot(path=folder / 'waiting-for-provisions.png')
        close_if_shown(page, '#dialogue-close')
        return True

    if flags['suppliesShared'] and 'boardingExchange' not in report:
        assert flags['landingMarked'] and flags['henryFound'] and flags['georgeFound'] and not flags['menRescued']
        activate(page.locator('[data-story-person="george"]'))
        expect(rail).to_be_visible(timeout=15000)
        lines = []
        for _ in range(5):
            line = rail.locator('#dialogue-text').inner_text()
            lines.append({'speaker':rail.get_attribute('data-speaker'), 'text':line})
            if re.search(r'come aboard', line, re.I):
                break
            next_turn = rail.locator('#dialogue-next')
            assert next_turn.get_attribute('aria-label') != 'Finish conversation', lines
            next_turn.click()
        assert 'come aboard' in lines[-1]['text'].lower() and lines[-1]['speaker'] == 'musgrave', lines
        assert state(page) == before
        report['boardingExchange'] = {'lines':lines, 'actions':before['actions']}
        save_report()
        page.screenshot(path=folder / 'ready-to-board.png')
        close_if_shown(page, '#dialogue-close')
    return False
