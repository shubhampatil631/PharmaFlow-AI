import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import {
    Activity,
    ArrowRight,
    Search,
    Network,
    Database,
    FileText,
    Shield,
    CheckCircle2
} from 'lucide-react';
import { WorkflowVisualizer } from '../components/dashboard/WorkflowVisualizer';

export function LandingPage() {
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: dashboardService.getDashboardStats,
        refetchInterval: 5000 // Poll every 5 seconds
    });

    const stats = dashboardData?.stats || {
        active_molecules: 0,
        docs_ingested: 0,
        active_agents: 0,
        pending_reviews: 0
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900 font-sans">
            {/* Hero Section */}
            <div className="bg-white pt-16 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="lg:flex lg:items-center lg:gap-12">
                        {/* Hero Text */}
                        <div className="lg:w-1/2 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold tracking-wide uppercase">
                                <Activity size={14} />
                                <span>PharmaFlow Intelligence Platform</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                                Clinical Asset Intelligence <br />
                                <span className="text-sky-600">Powered by Multi-Agent AI</span>
                            </h1>
                            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                                A specialized, enterprise-grade intelligence platform for pharmaceutical asset repurposing.
                                Ingest, analyze, and synthesize clinical trial data, patent landscapes, and commercial intelligence in real-time.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                                <Link
                                    to="/molecules"
                                    className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-sky-600/20"
                                >
                                    Launch Platform
                                    <ArrowRight size={16} />
                                </Link>
                                <Link
                                    to="/search"
                                    className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-md transition-all border border-slate-300 flex items-center justify-center gap-2 text-sm shadow-sm"
                                >
                                    <Search size={16} className="text-slate-400" />
                                    Explore Data
                                </Link>
                            </div>
                        </div>

                        {/* Hero Graphic - Denser, cleaner telemetry visual */}
                        <div className="hidden lg:block lg:w-1/2 mt-10 lg:mt-0">
                            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-2xl w-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-16 -mt-16 z-0"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                                        <div className="flex items-center gap-2">
                                            <Network size={16} className="text-sky-400" />
                                            <span className="text-sm font-semibold text-white tracking-wide uppercase">System Telemetry</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[10px] text-emerald-400 font-mono text-bold uppercase tracking-wider">Online</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <TelemetryMetric label="Local Molecules" value={isLoading ? "Loading..." : stats.active_molecules.toLocaleString()} />
                                        <TelemetryMetric label="Database Sync" value="ChEMBL, OpenTargets" />
                                        <TelemetryMetric label="Active Agents" value={isLoading ? "Loading..." : `${stats.active_agents} Dedicated`} />
                                        <TelemetryMetric label="Docs Ingested" value={isLoading ? "Loading..." : stats.docs_ingested.toLocaleString()} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Corporate Stats Strip - Dense */}
            <div className="bg-slate-50 border-b border-slate-200 py-6 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <StatItem value="CrewAI + Gemini + Groq" label="Core Intelligence Engine" />
                    <StatItem value="Real-time" label="Data Ingestion" />
                    <StatItem value="Explainable AI" label="Decision Tracing" />
                    <StatItem value="FastAPI + React" label="Local Deployment Base" />
                </div>
            </div>

            {/* Platform Capabilities - Dense grid */}
            <div className="bg-white py-12 px-4 sm:px-6 border-b border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Platform Capabilities</h2>
                        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                            A focused agentic architecture designed specifically for pharmaceutical market intelligence and compound validation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <EnterpriseFeatureCard
                            icon={Network}
                            title="Agentic Orchestration"
                            desc="Deploy specialized AI agents across intellectual property, market intelligence, and clinical domains to synthesize complete asset profiles."
                        />
                        <EnterpriseFeatureCard
                            icon={Database}
                            title="Contextual NLP Engine"
                            desc="Move beyond standard keyword retrieval. Advanced semantic understanding of biological, regulatory, and commercial phrasing."
                        />
                        <EnterpriseFeatureCard
                            icon={FileText}
                            title="Audit-Ready Reporting"
                            desc="Generate rigorous strategic reports with full data lineage. Every insight ensures regulatory compliance and objective trust."
                        />
                    </div>
                </div>
            </div>

            {/* Workflow Section - Tighter styling */}
            <div className="py-12 bg-slate-50 border-b border-slate-200 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">System Architecture & Pipeline</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            A transparent breakdown of our multi-agent operational workflow and structured data pipeline.
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <WorkflowVisualizer />
                    </div>
                </div>
            </div>

            {/* Security and Trust - Minimalist & Serious */}
            <div className="bg-white py-12 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="text-slate-700" size={24} />
                            <h2 className="text-2xl font-bold text-slate-900">Application Security Architecture</h2>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                            Your proprietary compound data and portfolio analyses remain strictly confidential. The platform operates locally with your own API instances to ensure data sovereignty.
                        </p>
                        <ul className="mt-5 space-y-3">
                            <li className="flex items-start gap-2 text-sm text-slate-700">
                                <CheckCircle2 size={18} className="text-sky-600 shrink-0 mt-0.5" />
                                <span><strong>Isolated Instances:</strong> Run locally or on dedicated cloud VMS.</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-700">
                                <CheckCircle2 size={18} className="text-sky-600 shrink-0 mt-0.5" />
                                <span><strong>Zero-Retention External APIs:</strong> Supported LLM providers do not train on your analyses.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-4 md:mt-0 shadow-sm">
                        <div className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4 uppercase tracking-wider">Tech Stack</div>
                        <div className="grid grid-cols-2 gap-3">
                            <ComplianceBadge label="CrewAI" />
                            <ComplianceBadge label="Gemini + Groq" />
                            <ComplianceBadge label="FastAPI" />
                            <ComplianceBadge label="React" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action - Compact */}
            <div className="py-12 bg-slate-900 text-white text-center px-4">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold">Accelerate Your Asset Strategy</h2>
                    <p className="text-slate-400 mt-3 mb-6 text-sm sm:text-base max-w-xl mx-auto">
                        Deploy PharmaFlow Intelligence to validate your repurposing pipeline with real-time, objective insights.
                    </p>
                    <Link
                        to="/molecules"
                        className="inline-flex px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-md transition-all shadow-sm"
                    >
                        Access Dashboard
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-8 bg-slate-50 border-t border-slate-200 text-slate-500 text-sm">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                        <Activity size={16} className="text-sky-600" />
                        PharmaFlow Systems Int.
                    </div>
                    <div>© {new Date().getFullYear()} PharmaFlow Systems Inc. All rights reserved.</div>
                </div>
            </footer>
        </div>
    );
}

function EnterpriseFeatureCard({ icon: Icon, title, desc }) {
    return (
        <div className="p-5 rounded-lg bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded bg-slate-50 border border-slate-100 text-sky-600">
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-slate-900">{title}</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
        </div>
    );
}

function TelemetryMetric({ label, value }) {
    return (
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">{label}</div>
            <div className="text-lg font-bold text-white tracking-tight">{value}</div>
        </div>
    );
}

function StatItem({ value, label }) {
    return (
        <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900">{value}</div>
            <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</div>
        </div>
    );
}

function ComplianceBadge({ label }) {
    return (
        <div className="py-2.5 px-3 bg-white border border-slate-200 rounded text-center text-xs font-bold text-slate-700 uppercase tracking-wide">
            {label}
        </div>
    );
}
