# Interakční kontrola

Rozsah: prezentační vrstva `dist/app.js`, bez změn modelu hádanek a formátu uložené hry.

- Cíle scény se při reakci nemění všechny najednou. Nepozměněné prvky, včetně postav, zůstávají v DOM; odstraní nebo vymění se jen odpovídající změněný cíl. Stejný obsah vrstvy změn světa se zbytečně znovu nevytváří. Animace postav se tak po běžné reakci nemusí restartovat.
- Fokus předmětů, cílů a východů zobrazí v interakčním řádku jejich název stejně jako ukazatel. Při výběru předmětu se zachová fokus na jeho tlačítku.
- Esc v otevřeném dialogu nepředává stejný stisk globálnímu rušení výběru; dialog může zavřít vlastní nativní chování. Po zavření se fokus vrací k původnímu, stále připojenému prvku. Potvrzený restart záměrně vrací fokus na scénu.

Ověření: `node --check adventure/dist/app.js` a `node --test adventure/tests/*.test.js`; 13 testů herního modelu prošlo. Tyto testy samy o sobě neověřují prohlížeč ani přístupnost dialogu.

Doporučená regresní kontrola v prohlížeči: klávesnicí vybrat předmět, otevřít nápovědu a zavřít Esc (výběr musí zůstat); projít tabulátorem cíle, inventář a východy; potvrdit restart; zkontrolovat, že po prohlídce a sebrání věci postava nepřeskočí v animaci. Zkontrolovat také práci bez animací a obnovení již uložené hry. Zpětná vazba při chůzi stále využívá stávající animaci a po dokončení obrazový symbol; nejde o plnohodnotně namluvené rozhraní.
