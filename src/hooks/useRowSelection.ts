import { useState } from 'react';

export function useRowSelection() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function setMany(ids: string[], isSelected: boolean) {
    const changes: Record<string, boolean> = {};
    for (const id of ids) {
      changes[id] = isSelected;
    }
    setSelected((prev) => ({
      ...prev,
      ...changes,
    }));
  }

  function clear() {
    setSelected({});
  }

  const selectedIds = Object.keys(selected).filter((id) => selected[id]);

  return { selected, toggle, setMany, selectedIds, clear };
}
