# Until We Return — the complete playable arc

The seven chapters follow the Grafton group from the wreck to the rescue of the two men left behind. They form one point-and-click adventure: players walk through painted locations, notice useful objects, combine materials and see their work alter the scene. A chapter ends through its physical departure point after its work is finished. Brief transitions carry the months that cannot sensibly be represented by a few minutes of clicking.

The player acts as **Alick McLaren in chapters I–V** and **Captain Thomas Musgrave in VI–VII**. A caption and portrait identify the change. Neither role is an authenticated portrait or a reconstruction of the person's inner life. Their dialogue is original dramatic writing. [Historical boundaries](HISTORICAL_ADAPTATION.md) distinguish events from adaptation.

The playable physical work, visual clues and changes in the rooms are described in the [illustrated revision](reviews/25-playable-revision.md). [Companion dialogue and historical sources](reviews/24-history-dialogue.md) document the voices and the invented actions in each chapter.

## I. The First Night

**Opening image:** rain crosses the broken Grafton; five people occupy different patches of shore. The player first understands distance by walking, then discovers the rope and pole by their shape in the debris.

The looped pole retrieves a sail. A lever opens the salvaged chest. The axe exposes dry wood. Canvas becomes a roof and a strip for a signal. The player solves three visible needs—cover, heat and something that can be seen from the sea—by returning between the shore, wreck and camp.

**Emotional turn:** five isolated figures become a group with a place to return to. Their conversations offer different concerns: Musgrave keeps looking at the ship, Raynal wants to put his skills to use, Henry thinks about a shared dry place, and George wants to hear a real voice.

**Closing image:** firelight and a moving scrap of sail. It is enough for this night; it is not a claim that a complete house was built on the first night.

## II. A Home by the Water

**Opening image:** the same people, a darker season, the inside of a shelter that needs constant attention. A dripping roof and an empty vessel communicate the work before a line of dialogue does.

The winter chapter connects materials gathered outside with needs inside: a repaired cover, water brought home and warmth maintained. A container is useful because of where it can be carried and filled. Repairs change the room instead of awarding abstract survival points.

**Emotional turn:** shelter becomes maintenance rather than a completed achievement. Henry's work is part of everyone's survival, and cooking or keeping a fire is not assigned to him as an innate or comic servant role. George admits that a clear task and an expected return make it easier to leave the house.

**Closing image:** the men can stop working for a moment. The roof is heard holding against the weather. Time passes toward the next year's more ambitious work.

## III. The Last Drill

**Opening image:** a workshop of salvaged material. Bellows, fuel and iron each have a different use; the player must bring them together before a furnace can work.

The first apparent prize is a drill. Testing it is part of the puzzle. Its failure returns information and usable material; it does not erase the run or demand repetition of the same recipe. The remaining metal can serve as fastenings for a smaller undertaking.

**Emotional turn:** Raynal's competence includes recognising a limit. Musgrave must release the picture of a larger vessel and listen to what the available tools can actually support. Other people's carrying, fuel preparation and patient help remain visible around the expert work.

**Closing image:** the failed tool beside useful fastenings. The camera's attention moves from the impossible large project toward the existing boat. The exact workshop sequence is an authored puzzle, not a metallurgical reconstruction.

## IV. Three Places

**Opening image:** the boat occupies the foreground, with the home that cannot travel behind it. The work is tangible: planks, fastenings, sealing material and sailcloth.

The player strengthens and prepares the boat through several separate inventory operations. The finished shape is visibly more substantial than the starting one. Completion means the vessel is ready for the passage; it does not imply that it is safe, spacious or able to carry everyone.

**Emotional turn:** there are three places on the voyage. Alick, Raynal and Musgrave leave; Henry and George remain. This is the documented division, not a player vote about whose life matters. Their brief replies make the shore's continuing work part of the plan. The full historical provisioning process is compressed; this chapter does not claim to simulate quantities for nineteen months or the weeks before the return.

**Closing image:** three figures and two. The promise is left unfinished on purpose. Preparing a boat is not the ending.

## V. Five Days at Sea

**Opening image:** a low horizon, the boat close around the player and almost no room for aimless walking. Interactions stay within the boat: line, sail, water and course.

The player secures the rig, removes water, attends to sail damage and establishes the course. The crew respond to the task in front of them. There are no reflex timers that demand repeated frantic clicks or punish the player for stopping to read a short line. The passage's length is carried by light, weather and the transition, not by pretending these few actions literally took five days.

**Emotional turn:** competence has become cooperation at very close quarters. Musgrave and Raynal are present; Henry and George are not ghostly speakers on the boat. The horizon changes only after the necessary work is done.

**Closing image:** Port Adventure. Arrival is relief, but two men are still on Auckland Island.

## VI. Help from the Mainland

**Opening image:** a clear perspective change to Musgrave. The places and people of reception are not a reward chest. They make a second voyage possible.

The sequence compresses the welcome at Port Adventure and the subsequent organising work at Invercargill. A chart and the survivor's record make the destination intelligible; provisions and equipment prepare the return. A short transition identifies the geographical change. The player is not purchasing rescue through an invented personal fortune.

**Emotional turn:** Musgrave has to accept practical help. Captain Cross, John Macpherson and the people who provided hospitality, funds, clothing and supplies deserve credit in the historical ending. The game does not turn them into interchangeable resources or invent biographical dialogue for unnamed Māori residents.

**Closing image:** Flying Scud ready to sail with Cross and Musgrave. Raynal and Alick are not silently added to this return voyage.

## VII. Until We Return

**Opening image:** a familiar shore viewed with new uncertainty. Musgrave knows the place but cannot know what the last weeks have been like for Henry and George.

The landing must be made usable, supplies brought in, and both men found and brought to the rescue point. The playable check accounts for each man separately; finding one cannot finish the chapter. This sequence compresses the actual landing and departure into spatial tasks. It does not invent a new historical disappearance, injury or survival crisis.

**Emotional turn:** the waiting pair answer in their own brief voices. Relief is not used to erase the strain they endured. There is no triumphant lecture that claims good leadership alone explains survival.

**Closing image:** two empty places in the house, then two occupied places in the rescue. The ending presents **five individual portraits** and the words **“All five survived. The promise was kept.”** It is a montage of the completed rescue, not a picture of all five standing together on Flying Scud.

## Dialogue and pacing

[voyage-stories.js](dist/voyage-stories.js) extends the first chapter's [stories.js](dist/stories.js). Each encounter contains three short, optional beats. The module supplies opening and completed-work variants, plus specific reactions to the repaired roof, failed drill, sealed boat, cleared water, prepared rescue route and discovery of either waiting man. Lines do not unlock essential items. The player can stop or leave a conversation without losing progress.

Ordinary play remains visual. Chapter captions are short. The source notes and full historical comparison belong in the project documentation and optional ending material, not in a mandatory succession of essays. English device narration remains optional and does not represent recorded actors or historical voices.

There is one successful ending: both waiting men are rescued. Incorrect item combinations preserve essential objects; a material failure that belongs to the story produces a usable next step. The story's tension comes from what the characters must do and leave behind, not from a hidden irreversible punishment.

## The separate Invercauld story

Invercauld is acknowledged in the historical ending as another ordeal on another part of the same island. It is not a secret camp for the player to discover or a crossover rescue. The initial modern source search and broader research project still matter, but this playable campaign follows the Grafton route. A separate Invercauld campaign would require its own attributed perspectives and cannot be created by swapping names into this one.
