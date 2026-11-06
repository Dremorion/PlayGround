# PlayGround

<!-- omgithub:readme:start -->
## 🚀 Build, play, and remix with OMGithub

**Created using [OMGithub.com](https://go.ondev.store/).**

[![OMGithub](https://img.shields.io/badge/OMGithub-Open%20project-orange?style=for-the-badge)](https://go.ondev.store/Dremorion/PlayGround)
[![GitHub](https://img.shields.io/badge/GitHub-Source-181717?logo=github&style=for-the-badge)](https://github.com/Dremorion/PlayGround)

- 🎮 [Open the project](https://go.ondev.store/Dremorion/PlayGround).
- ✨ [Remix this project](https://go.ondev.store/Dremorion/PlayGround?remix=1).
- 💻 [Explore the source](https://github.com/Dremorion/PlayGround).
- 🛠️ [Check build runs](https://github.com/Dremorion/PlayGround/actions).
- 🐛 [Report an issue](https://github.com/Dremorion/PlayGround/issues).
- 👤 [Explore the creator's projects](https://go.ondev.store/Dremorion).
- 🌍 [Create with OMGithub](https://go.ondev.store/).
<!-- omgithub:readme:end -->

## Legacy of Eternia — First Light

Open `index.html` in a browser (or serve the repository with any static HTTP server) to play.

### Controls

- Move with **WASD / arrow keys**, or the left virtual joystick on touch screens.
- Click a monster to target it; press **Space / Enter** or tap **Attack** when nearby.
- Use **1 / Power** for Cleave, **Q / potion slot** to heal, and **I / Inventory** to inspect loot.
- Collect nearby gold and equipment by walking over it or tapping the drop; tap a packed item in **Inventory** to equip it. Defeated monsters return after a short respawn.

### Multiplayer foundation

This is a **single-player prototype**, not an offline simulation of an MMO. There are no fake human players. The client creates a stable session player ID and has a transport seam for player commands (`move`, `attack`, `skill`) plus versioned authoritative snapshots (self position/health/mana, player roster, and shared world state). No server transport is connected yet; combat and world simulation currently run locally. A production server should validate commands and own movement, combat, respawns, drops, and shared state before broadcasting snapshots.
