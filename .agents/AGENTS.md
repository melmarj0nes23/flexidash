
## Recharts ResponsiveContainer Mobile Fix
When using `ResponsiveContainer` from `recharts` inside a flex container (e.g. `flex-1`), NEVER use a hardcoded height or `height="100%"` directly inside the flex item without absolute positioning, as this causes clipping bugs or infinite resize loops on mobile (Safari/Webkit). 
Always wrap the `ResponsiveContainer` like this:
```tsx
<div className="flex-1 w-full relative min-h-[256px]">
  <div className="absolute inset-0">
    <ResponsiveContainer width="99%" height="100%">
      ...
    </ResponsiveContainer>
  </div>
</div>
```
