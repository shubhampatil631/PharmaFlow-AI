import React, { useState } from 'react';
import { AgentOutputPanel } from './AgentOutputPanel';

export function AgentOutputsAccordion({ outputs }) {
    const [openPanel, setOpenPanel] = useState(null);

    const togglePanel = (agentName) => {
        setOpenPanel(openPanel === agentName ? null : agentName);
    };

    if (!outputs || outputs.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <p className="text-slate-500">No agent outputs available yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {outputs.map((output) => (
                <AgentOutputPanel
                    key={output.agent_name}
                    agentName={output.agent_name}
                    data={output}
                    isOpen={openPanel === output.agent_name}
                    onToggle={() => togglePanel(output.agent_name)}
                />
            ))}
        </div>
    );
}
