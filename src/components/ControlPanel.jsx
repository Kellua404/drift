import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useDriftStore } from '../store/useDriftStore';
import { ControlGroup } from './ControlGroup';
import { Slider } from './Slider';
import { Segmented } from './Segmented';
import { SceneChips } from './SceneChips';

const FORCE_OPTIONS = [
  { value: 'repel', label: 'Repel' },
  { value: 'attract', label: 'Attract' },
  { value: 'swirl', label: 'Swirl' },
];

export function ControlPanel({ isMobile }) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    count, flow, drift, forceMode, forceRadius, forceStrength,
    haze, focus, bokeh, bloom, sceneName, setParam, applyScene,
  } = useDriftStore();

  const panel = (
    <motion.div
      className="rounded-2xl overflow-hidden border border-white/[0.07]"
      style={{
        background: 'rgba(16, 13, 28, 0.72)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        width: isMobile ? '100%' : '360px',
      }}
    >
      {/* Header — whole bar is tappable so it reopens even where the
          action bar overlaps the right edge on mobile */}
      <button
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Expand controls' : 'Collapse controls'}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-white/[0.06] text-haze-400 hover:text-haze-200 transition-colors"
        style={{ paddingRight: isMobile ? 60 : undefined }}
      >
        <span
          className="font-hanken text-haze-200"
          style={{ fontSize: 12, letterSpacing: '0.06em' }}
        >
          Controls
        </span>
        {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 py-4 flex flex-col gap-5 overflow-y-auto"
              style={{ maxHeight: isMobile ? '60vh' : '70vh' }}
            >
              <SceneChips activeScene={sceneName} onSelect={applyScene} />

              <ControlGroup title="Field">
                <Slider label="Density" value={count} min={200} max={2600} step={1}
                  displayValue={Math.round(count)}
                  onChange={v => setParam('count', Math.round(v))} />
                <Slider label="Flow" value={flow} min={0} max={2} step={0.01}
                  onChange={v => setParam('flow', v)} />
                <Slider label="Camera Drift" value={drift} min={0} max={2} step={0.01}
                  onChange={v => setParam('drift', v)} />
              </ControlGroup>

              <ControlGroup title="Force">
                <Segmented label="Mode" options={FORCE_OPTIONS} value={forceMode}
                  onChange={v => setParam('forceMode', v)} />
                <Slider label="Reach" value={forceRadius} min={1} max={10} step={0.1}
                  onChange={v => setParam('forceRadius', v)} />
                <Slider label="Strength" value={forceStrength} min={0} max={4} step={0.05}
                  onChange={v => setParam('forceStrength', v)} />
              </ControlGroup>

              <ControlGroup title="Atmosphere">
                <Slider label="Haze" value={haze} min={0.005} max={0.085} step={0.001}
                  onChange={v => setParam('haze', v)} />
                <Slider label="Focus" value={focus} min={0} max={0.05} step={0.001}
                  onChange={v => setParam('focus', v)} />
                <Slider label="Bokeh" value={bokeh} min={1} max={9} step={0.1}
                  onChange={v => setParam('bokeh', v)} />
                <Slider label="Bloom" value={bloom} min={0.2} max={1.8} step={0.05}
                  onChange={v => setParam('bloom', v)} />
              </ControlGroup>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  if (isMobile) {
    return (
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-20 px-3 pb-3"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {panel}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed bottom-6 left-6 z-20"
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      {panel}
    </motion.div>
  );
}
