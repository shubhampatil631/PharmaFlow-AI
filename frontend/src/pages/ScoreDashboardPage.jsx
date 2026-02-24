import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ScoreOverview } from '../components/scoring/ScoreOverview';
import { ScoreBreakdown } from '../components/scoring/ScoreBreakdown';
import { ExplainabilityPanel } from '../components/scoring/ExplainabilityPanel';
import { scoringService } from '../services/scoringService';
import { toast } from 'sonner';
import debounce from 'lodash.debounce';

export function ScoreDashboardPage() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Separate state for sliders to be responsive immediately
    const [components, setComponents] = useState([]);

    useEffect(() => {
        loadInitialData();
    }, [taskId]);

    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const initial = await scoringService.getScore(taskId);
            setData(initial);
            setComponents(initial.components);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load scoring data");
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced recompute to avoid API spam while dragging
    const debouncedRecompute = useCallback(
        debounce(async (updatedComponents) => {
            try {
                const result = await scoringService.recomputeScore(taskId, updatedComponents);
                setData(prev => ({
                    ...prev,
                    repurposing_score: result.repurposing_score,
                    risk_score: result.risk_score,
                    explanation: result.explanation
                }));
                // toast.success("Score recomputed");
            } catch (err) {
                console.error(err);
            }
        }, 500),
        [taskId]
    );

    const handleWeightChange = (id, newWeight) => {
        const updated = components.map(c =>
            c.id === id ? { ...c, weight: newWeight } : c
        );
        setComponents(updated);
        debouncedRecompute(updated);
    };

    const handleManualRecompute = () => {
        toast.promise(scoringService.recomputeScore(taskId, components), {
            loading: 'Recomputing...',
            success: (result) => {
                setData(prev => ({ ...prev, ...result }));
                return 'Analysis updated successfully';
            },
            error: 'Failed to update'
        });
    };

    if (isLoading || !data) {
        return <div className="p-12 text-center text-slate-500">Loading analysis...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to={`/agents/tasks/${taskId}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Scoring & Decision Analysis</h1>
                    <p className="text-slate-500">Task ID: {taskId} • Scenario Simulation Mode</p>
                </div>
            </div>

            <ScoreOverview
                score={data.repurposing_score}
                risk={data.risk_score}
                onRecompute={handleManualRecompute}
                onExport={() => {
                    toast.success("Drafting new report...");
                    navigate('/reports');
                }}
            />

            <div className="flex justify-end mb-4">
                <button
                    onClick={() => {
                        const name = prompt("Enter scenario name:");
                        if (name) {
                            scoringService.saveSnapshot(taskId, { ...data, name })
                                .then(() => toast.success("Scenario saved"))
                                .catch(() => toast.error("Failed to save"));
                        }
                    }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                    + Save Current Scenario
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Component Breakdown</h2>
                        <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
                            Adjust weights to simulate scenarios
                        </span>
                    </div>
                    <ScoreBreakdown
                        components={components}
                        onWeightChange={handleWeightChange}
                    />
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-6">Explanation</h2>
                    <ExplainabilityPanel text={data.explanation} />
                </div>
            </div>
        </div>
    );
}

export default ScoreDashboardPage;
