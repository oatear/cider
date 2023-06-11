# 4 Export - Tabletop Simulator Export

## 4.1 Export from Cider
Go to `File` > `Export Cards`. With Card Sheet selected, also select `Tabletop Simulator` in the dropdown.

![screen-tts-1]

By default TTS recommends sheet images no larger than `4096 x 4096` pixels ([Tabletop Simulator max pixels][tts-max-pixels-url]). However on some systems, people have been able to import sheets with larger dimensions. The Max TTS Pixels setting in Cider lets you override the 4096 max pixel setting and set it to a larger setting that works for you.

![screen-tts-2]

Exported Image

![screen-tts-3]

## 4.2 Import into Tabletop Simulator

Start up Tabletop Simulator and to go `Objects` > `Components` > `Cards` > `Custom Deck`.

![screen-tts-4]

Use the below settings to import your card sheets. Make sure to select your `sheet-front-*` image in `Face` and your `sheet-back-*` image in `Back`. If your export included more than 69 cards, then you will have to create several custom decks. Once created you can combine the cards into a single deck.

Make sure to set the `Number` of cards in the sheet.

![screen-tts-5]

Congratulations you have imported your cards into TTS.

![screen-tts-6]


[screen-tts-1]: cider-app/src/assets/screen-tts-1.png
[screen-tts-2]: cider-app/src/assets/screen-tts-2.png
[screen-tts-3]: cider-app/src/assets/screen-tts-3.png
[screen-tts-4]: cider-app/src/assets/screen-tts-4.png
[screen-tts-5]: cider-app/src/assets/screen-tts-5.png
[screen-tts-6]: cider-app/src/assets/screen-tts-6.png
[tts-max-pixels-url]: https://kb.tabletopsimulator.com/custom-content/asset-creation/