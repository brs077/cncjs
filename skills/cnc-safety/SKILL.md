---
name: cnc-safety
description: Emergency stop, feed hold, and jog cancel for CNC safety. Use IMMEDIATELY when the user reports a dangerous situation, wants to stop the machine, or needs to halt all motion.
---

# CNC Safety Controls

**These tools are always available when a port is connected. Use immediately when safety is a concern.**

## Available Tools

- **emergency_stop** — EMERGENCY STOP: immediately halts ALL motion via GRBL soft reset (0x18). Use in any dangerous situation. Machine enters Alarm state and requires unlock ($X) or re-homing ($H).
- **feed_hold** — Controlled deceleration to stop. Safer than emergency stop for non-critical pauses. Can be resumed with cycle start.
- **jog_cancel** — Cancel any active jog movement immediately.

## When to Use

- **emergency_stop**: Something is wrong — tool crash, unexpected motion, material shifting, any danger
- **feed_hold**: Routine pause — need to check something, adjust coolant, inspect cut
- **jog_cancel**: Stop a jog that's going in the wrong direction

## Recovery After Emergency Stop

1. Machine enters Alarm state after emergency stop
2. Assess the situation physically before proceeding
3. Use `unlock_machine` ($X) to clear the alarm
4. Or use `home_machine` ($H) to re-home and re-establish position
5. Verify position with `get_machine_position` before resuming work
