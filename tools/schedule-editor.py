#!/usr/bin/env python3
"""
Schedule Editor — GUI tool to update the availability schedule in config.js.
Uses tkinter (ships with Python). No external dependencies.

Usage:
    python3 schedule-editor.py
    python3 schedule-editor.py --repo /path/to/nj22az.github.io
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tkinter as tk
from tkinter import messagebox

# ── Defaults ──────────────────────────────────────────────────────────────────

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
DEFAULT_ROWS = [
    {"time": "08:00 – 12:00", "slots": [True, True, True, True, True, False, False]},
    {"time": "13:00 – 17:00", "slots": [True, True, True, True, True, False, False]},
]

ACCENT = "#3ea88c"
ACCENT_HOVER = "#35967b"
BG = "#f5f0e8"
CARD_BG = "#ffffff"
BORDER = "#d9d4cb"
INK = "#2c2a26"
INK_LIGHT = "#6b6560"
SLOT_ON_BG = "#e8f4ee"
SLOT_OFF_BG = "#f5f0e8"


# ── Config.js parser ─────────────────────────────────────────────────────────

def find_config(repo_path):
    return os.path.join(repo_path, "config.js")


def read_schedule(config_path):
    """Extract schedule data from config.js using regex."""
    with open(config_path, "r", encoding="utf-8") as f:
        text = f.read()

    # Find the schedule block
    match = re.search(
        r'schedule:\s*\{(.*?)\},?\s*\n\s*\}',
        text,
        re.DOTALL,
    )
    if not match:
        return None, text

    block = match.group(1)

    # Extract note
    note_match = re.search(r'note:\s*"([^"]*)"', block)
    note = note_match.group(1) if note_match else ""

    # Extract rows
    rows = []
    row_pattern = re.compile(
        r'\{\s*time:\s*"([^"]+)"\s*,\s*slots:\s*\[([^\]]+)\]\s*\}'
    )
    for m in row_pattern.finditer(block):
        time_label = m.group(1)
        slots_str = m.group(2)
        slots = [s.strip() == "true" for s in slots_str.split(",")]
        # Pad or trim to 7 days
        slots = (slots + [False] * 7)[:7]
        rows.append({"time": time_label, "slots": slots})

    if not rows:
        rows = DEFAULT_ROWS

    return {"note": note, "rows": rows}, text


def write_schedule(config_path, original_text, schedule):
    """Write updated schedule back to config.js."""
    def format_row(row):
        slots = ", ".join("true" if s else "false" for s in row["slots"])
        # Use unicode escape for the dash
        time_str = row["time"]
        return '        { time: "' + time_str + '", slots: [' + slots + "] }"

    rows_str = ",\n".join(format_row(r) for r in schedule["rows"])

    new_block = (
        'schedule: {\n'
        '      title: "Availability",\n'
        '      subtitle: "Schedule",\n'
        '      note: "' + schedule["note"] + '",\n'
        '      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],\n'
        '      rows: [\n' + rows_str + ',\n'
        '      ],\n'
        '    }'
    )

    # Replace the schedule block
    updated = re.sub(
        r'schedule:\s*\{.*?\},?\s*\n\s*\}',
        new_block,
        original_text,
        count=1,
        flags=re.DOTALL,
    )

    with open(config_path, "w", encoding="utf-8") as f:
        f.write(updated)


# ── Git operations ────────────────────────────────────────────────────────────

def git_push(repo_path):
    """Stage config.js, commit, and push."""
    try:
        subprocess.run(
            ["git", "add", "config.js"],
            cwd=repo_path, check=True, capture_output=True,
        )
        subprocess.run(
            ["git", "commit", "-m", "Update availability schedule"],
            cwd=repo_path, check=True, capture_output=True,
        )
        subprocess.run(
            ["git", "push"],
            cwd=repo_path, check=True, capture_output=True,
        )
        return True, "Pushed successfully!"
    except subprocess.CalledProcessError as e:
        return False, e.stderr.decode() if e.stderr else str(e)


# ── GUI ───────────────────────────────────────────────────────────────────────

class ScheduleEditor(tk.Tk):
    def __init__(self, repo_path):
        super().__init__()
        self.repo_path = repo_path
        self.config_path = find_config(repo_path)
        self.title("Schedule Editor")
        self.configure(bg=BG)
        self.resizable(False, False)

        # Load schedule
        data, self.original_text = read_schedule(self.config_path)
        if data is None:
            messagebox.showerror("Error", "Could not find schedule block in config.js")
            sys.exit(1)

        self.schedule = data
        self.slot_vars = []  # List of lists of BooleanVar
        self.time_vars = []  # List of StringVar

        self._build_ui()
        self._center_window()

    def _center_window(self):
        self.update_idletasks()
        w = self.winfo_width()
        h = self.winfo_height()
        x = (self.winfo_screenwidth() // 2) - (w // 2)
        y = (self.winfo_screenheight() // 2) - (h // 2)
        self.geometry(f"+{x}+{y}")

    def _build_ui(self):
        # Title bar
        header = tk.Frame(self, bg=ACCENT, padx=20, pady=14)
        header.pack(fill="x")
        tk.Label(
            header, text="Availability Schedule",
            font=("Helvetica", 16, "bold"), fg="white", bg=ACCENT,
        ).pack(side="left")

        # Main card
        card = tk.Frame(self, bg=CARD_BG, padx=24, pady=20,
                        highlightbackground=BORDER, highlightthickness=1)
        card.pack(padx=20, pady=(20, 10), fill="x")

        # Day headers
        tk.Label(card, text="Time", font=("Helvetica", 11, "bold"),
                 fg=INK_LIGHT, bg=CARD_BG, width=16, anchor="w").grid(
            row=0, column=0, padx=(0, 8), pady=(0, 8))

        for j, day in enumerate(DAYS):
            tk.Label(card, text=day, font=("Helvetica", 11, "bold"),
                     fg=INK, bg=CARD_BG, width=5).grid(
                row=0, column=j + 1, pady=(0, 8))

        # Rows
        for i, row in enumerate(self.schedule["rows"]):
            time_var = tk.StringVar(value=row["time"])
            self.time_vars.append(time_var)

            entry = tk.Entry(card, textvariable=time_var, font=("Helvetica", 10),
                             width=16, fg=INK, bg=BG, relief="flat",
                             highlightbackground=BORDER, highlightthickness=1)
            entry.grid(row=i + 1, column=0, padx=(0, 8), pady=4)

            row_vars = []
            for j, on in enumerate(row["slots"]):
                var = tk.BooleanVar(value=on)
                row_vars.append(var)
                btn = tk.Checkbutton(
                    card, variable=var, onvalue=True, offvalue=False,
                    bg=CARD_BG, activebackground=CARD_BG,
                    selectcolor=SLOT_ON_BG,
                    indicatoron=False, width=4, height=1,
                    relief="flat", overrelief="flat",
                    font=("Helvetica", 14),
                    fg=ACCENT, activeforeground=ACCENT_HOVER,
                    command=lambda b=None: self._refresh_btn_text(),
                )
                btn.grid(row=i + 1, column=j + 1, pady=4, padx=2)
                btn._var = var
            self.slot_vars.append(row_vars)

        self._refresh_btn_text()

        # Add/remove row buttons
        row_btns = tk.Frame(card, bg=CARD_BG)
        row_btns.grid(row=len(self.schedule["rows"]) + 1, column=0,
                      columnspan=8, pady=(10, 0), sticky="w")

        tk.Button(
            row_btns, text="+ Add Row", font=("Helvetica", 10),
            fg=ACCENT, bg=CARD_BG, relief="flat", cursor="hand2",
            command=self._add_row,
        ).pack(side="left", padx=(0, 10))

        tk.Button(
            row_btns, text="− Remove Last", font=("Helvetica", 10),
            fg="#c0392b", bg=CARD_BG, relief="flat", cursor="hand2",
            command=self._remove_row,
        ).pack(side="left")

        # Note field
        note_frame = tk.Frame(self, bg=BG, padx=20)
        note_frame.pack(fill="x", pady=(10, 10))
        tk.Label(note_frame, text="Note:", font=("Helvetica", 10, "bold"),
                 fg=INK_LIGHT, bg=BG).pack(anchor="w")
        self.note_var = tk.StringVar(value=self.schedule["note"])
        tk.Entry(
            note_frame, textvariable=self.note_var, font=("Helvetica", 10),
            fg=INK, bg=CARD_BG, relief="flat",
            highlightbackground=BORDER, highlightthickness=1,
        ).pack(fill="x", pady=(4, 0), ipady=6)

        # Action buttons
        actions = tk.Frame(self, bg=BG, padx=20, pady=10)
        actions.pack(fill="x", pady=(0, 20))

        tk.Button(
            actions, text="Save to config.js",
            font=("Helvetica", 12, "bold"),
            fg="white", bg=ACCENT, activebackground=ACCENT_HOVER,
            relief="flat", padx=20, pady=10, cursor="hand2",
            command=self._save,
        ).pack(side="left", padx=(0, 10))

        tk.Button(
            actions, text="Save & Push to GitHub",
            font=("Helvetica", 12, "bold"),
            fg="white", bg="#2c2a26", activebackground="#444",
            relief="flat", padx=20, pady=10, cursor="hand2",
            command=self._save_and_push,
        ).pack(side="left")

        # Status label
        self.status_var = tk.StringVar(value="")
        self.status_label = tk.Label(
            self, textvariable=self.status_var,
            font=("Helvetica", 10), fg=INK_LIGHT, bg=BG,
        )
        self.status_label.pack(pady=(0, 15))

    def _refresh_btn_text(self):
        """Update checkbutton text to show ● or —."""
        for widget in self.winfo_children():
            self._update_checkbuttons(widget)

    def _update_checkbuttons(self, parent):
        for child in parent.winfo_children():
            if isinstance(child, tk.Checkbutton) and hasattr(child, "_var"):
                child.configure(text="●" if child._var.get() else "—")
            if child.winfo_children():
                self._update_checkbuttons(child)

    def _add_row(self):
        """Rebuild UI with an extra row."""
        self.schedule["rows"].append(
            {"time": "00:00 – 00:00", "slots": [False] * 7}
        )
        self._collect_data()
        for w in self.winfo_children():
            w.destroy()
        self.slot_vars.clear()
        self.time_vars.clear()
        self._build_ui()

    def _remove_row(self):
        if len(self.schedule["rows"]) <= 1:
            return
        self.schedule["rows"].pop()
        self._collect_data()
        for w in self.winfo_children():
            w.destroy()
        self.slot_vars.clear()
        self.time_vars.clear()
        self._build_ui()

    def _collect_data(self):
        """Read current GUI state into self.schedule."""
        rows = []
        for i, row_vars in enumerate(self.slot_vars):
            if i < len(self.time_vars):
                rows.append({
                    "time": self.time_vars[i].get(),
                    "slots": [v.get() for v in row_vars],
                })
        if rows:
            self.schedule["rows"] = rows
        if hasattr(self, "note_var"):
            self.schedule["note"] = self.note_var.get()

    def _save(self):
        self._collect_data()
        try:
            write_schedule(self.config_path, self.original_text, self.schedule)
            # Re-read so subsequent saves work correctly
            _, self.original_text = read_schedule(self.config_path)
            self.status_var.set("✓ Saved to config.js")
            self.status_label.configure(fg=ACCENT)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save:\n{e}")

    def _save_and_push(self):
        self._save()
        ok, msg = git_push(self.repo_path)
        if ok:
            self.status_var.set("✓ Saved & pushed to GitHub")
            self.status_label.configure(fg=ACCENT)
        else:
            self.status_var.set("⚠ Saved locally, push failed")
            self.status_label.configure(fg="#c0392b")
            messagebox.showwarning("Push failed", msg)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Schedule Editor for nj22az.github.io")
    parser.add_argument(
        "--repo", default=os.path.dirname(os.path.abspath(__file__)) + "/..",
        help="Path to the repository root (default: parent of tools/)",
    )
    args = parser.parse_args()

    repo = os.path.abspath(args.repo)
    config = find_config(repo)
    if not os.path.isfile(config):
        print(f"Error: config.js not found at {config}")
        print(f"Use --repo to specify the repository path.")
        sys.exit(1)

    app = ScheduleEditor(repo)
    app.mainloop()


if __name__ == "__main__":
    main()
