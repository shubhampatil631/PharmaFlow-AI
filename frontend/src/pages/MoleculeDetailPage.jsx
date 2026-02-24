import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { moleculeService } from '../services/moleculeService';
import { ArrowLeft, Activity, FileText, Share2, Play, FlaskConical, Database, ExternalLink } from 'lucide-react';
import { RequestEvalDialog } from '../components/molecules/RequestEvalDialog';

export function MoleculeDetailPage() {
    const { id } = useParams();
    const [isEvalOpen, setIsEvalOpen] = useState(false);
    const [isEnriching, setIsEnriching] = useState(false);

    const { data: molecule, isLoading, refetch } = useQuery({
        queryKey: ['molecule', id],
        queryFn: () => moleculeService.getMoleculeById(id)
    });

    const handleEnrich = async () => {
        setIsEnriching(true);
        try {
            await moleculeService.enrichMolecule(id);
            refetch();
        } catch (error) {
            console.error("Enrichment failed", error);
        } finally {
            setIsEnriching(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading molecule details...</div>;
    if (!molecule) return <div className="p-8 text-center text-red-500">Molecule not found</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Structure Placeholder / View */}
                    <div className="w-full md:w-64 h-64 bg-white rounded-xl border border-slate-200 flex items-center justify-center relative group overflow-hidden shadow-sm">
                        {molecule.structure_2d ? (
                            <>
                                <img
                                    src={molecule.structure_2d}
                                    alt={`${molecule.name} 2D Structure`}
                                    className="w-full h-full object-contain p-4"
                                />
                                {molecule.structure_3d && (
                                    <a
                                        href={molecule.structure_3d}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute bottom-3 right-3 bg-white/90 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm flex items-center gap-1.5"
                                    >
                                        <FlaskConical size={14} />
                                        3D SDF
                                    </a>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
                                <div className="text-center p-4 relative z-10">
                                    <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 shadow-sm flex items-center justify-center">
                                        <FlaskConical className="text-slate-300" size={32} />
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">No Structure Available</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex-1 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                                        Active Investigation
                                    </span>
                                    <span className="text-slate-400 text-xs font-mono">CAS: {molecule.cas_number || 'N/A'}</span>
                                    {molecule.iupac_name && <span className="text-slate-500 text-xs truncate max-w-md" title={molecule.iupac_name}>{molecule.iupac_name}</span>}
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">{molecule.name}</h1>
                                <p className="text-slate-500 max-w-xl leading-relaxed">
                                    {molecule.description || 'Comprehensive molecular profile awaiting analysis. Run an evaluation to generate detailed pharamacological insights.'}
                                </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button
                                    onClick={handleEnrich}
                                    disabled={isEnriching}
                                    className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-all shadow-sm font-medium disabled:opacity-50"
                                >
                                    <Database size={16} />
                                    {isEnriching ? 'Syncing...' : 'Sync Data'}
                                </button>
                                <button
                                    onClick={() => setIsEvalOpen(true)}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-all shadow-sm font-medium"
                                >
                                    <Play size={16} />
                                    Run Analysis
                                </button>
                                <button className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Interactive Tabs / Metrics */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mol. Weight</span>
                                <p className="text-lg font-semibold text-slate-700">{molecule.molecular_weight || 'N/A'} <span className="text-xs font-normal text-slate-400">g/mol</span></p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Formula</span>
                                <p className="text-lg font-semibold text-slate-700">{molecule.formula || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status</span>
                                <p className={`text-lg font-semibold flex items-center gap-1.5 capitalize ${molecule.status === 'approved' ? 'text-green-600' : 'text-blue-600'}`}>
                                    <span className={`w-2 h-2 rounded-full ${molecule.status === 'approved' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                    {molecule.status || 'Unknown'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="col-span-2 space-y-6">
                    <section className="bg-white p-6 rounded-xl border shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Summary</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-slate-500">Description</h3>
                                <p className="mt-1 text-slate-700 leading-relaxed">
                                    {molecule.description || 'No description provided.'}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-slate-500">Synonyms</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {molecule.synonyms?.length ? molecule.synonyms.map(s => (
                                        <span key={s} className="px-2 py-1 bg-slate-100 rounded text-sm text-slate-600">
                                            {s}
                                        </span>
                                    )) : <span className="text-sm text-slate-400">None</span>}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* External Data Section */}
                    <section className="bg-white p-6 rounded-xl border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Database size={20} />
                                External Data Intelligence
                            </h2>
                            {molecule.last_enriched_at && (
                                <span className="text-xs text-slate-400">
                                    Synced: {new Date(molecule.last_enriched_at).toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* Literature */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Scientific Literature (PubMed/EuropePMC)
                            </h3>
                            <div className="space-y-3">
                                {molecule.literature?.length ? molecule.literature.map((lit, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                                        <a href={`https://pubmed.ncbi.nlm.nih.gov/${lit.pmid}`} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline flex items-start gap-1">
                                            {lit.title} <ExternalLink size={12} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                        {lit.abstract && (
                                            <p className="text-sm text-slate-600 mt-2 line-clamp-2" title={lit.abstract}>
                                                {lit.abstract}
                                            </p>
                                        )}
                                        <div className="text-xs text-slate-500 mt-2 flex flex-wrap gap-x-3 gap-y-1">
                                            <span className="font-medium text-slate-700">{lit.journal}</span>
                                            <span>{lit.year}</span>
                                            <span>PMID: {lit.pmid}</span>
                                            {lit.doi && (
                                                <a href={`https://doi.org/${lit.doi}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    DOI: {lit.doi}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )) : <div className="text-sm text-slate-400 italic">No literature data available. Click "Sync Data" to fetch.</div>}
                            </div>
                        </div>

                        {/* Clinical Trials */}
                        <div>
                            <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Clinical Trials (ClinicalTrials.gov)
                            </h3>
                            <div className="space-y-3">
                                {molecule.clinical_trials?.length ? molecule.clinical_trials.map((trial, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-start">
                                        <div>
                                            <a href={trial.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline flex items-center gap-1">
                                                {trial.title} <ExternalLink size={12} />
                                            </a>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {trial.phase || 'Phase Unknown'} • {trial.conditions?.join(', ')}
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded font-medium border ${trial.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-100' :
                                            trial.status === 'RECRUITING' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                            {trial.status}
                                        </span>
                                    </div>
                                )) : <div className="text-sm text-slate-400 italic">No clinical trial data available. Click "Sync Data" to fetch.</div>}
                            </div>
                        </div>

                        {/* Molecular Targets */}
                        <div className="mt-6 border-t border-slate-100 pt-6">
                            <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                Molecular Targets (OpenTargets)
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {molecule.targets?.length ? molecule.targets.map((t, idx) => (
                                    <div key={idx} className="bg-purple-50 border border-purple-100 px-3 py-2 rounded-lg flex flex-col max-w-[200px]" title={t.target_name}>
                                        <span className="font-bold text-slate-700 text-sm">{t.target_symbol}</span>
                                        <span className="text-xs text-slate-500 truncate">{t.target_name}</span>
                                    </div>
                                )) : <div className="text-sm text-slate-400 italic">No molecular target data available. Click "Sync Data" to fetch.</div>}
                            </div>
                        </div>

                        {/* Bioactivity Data */}
                        <div className="mt-6 border-t border-slate-100 pt-6">
                            <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                Bioactivity Data (ChEMBL)
                            </h3>
                            <div className="space-y-2">
                                {molecule.bioactivity?.length ? molecule.bioactivity.map((act, idx) => (
                                    <div key={idx} className="bg-orange-50 border border-orange-100 px-3 py-2 rounded-lg flex justify-between items-center text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-700">{act.target_name || 'Unknown Target'}</span>
                                            <span className="text-xs text-slate-500">{act.target_chembl_id}</span>
                                        </div>
                                        <div className="font-mono text-slate-600 bg-white px-2 py-1 rounded border border-orange-100">
                                            {act.standard_type}: {act.standard_value} {act.standard_units}
                                        </div>
                                    </div>
                                )) : <div className="text-sm text-slate-400 italic">No bioactivity data available. Click "Sync Data" to fetch.</div>}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-xl border shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FileText size={20} />
                            Linked Reports
                        </h2>
                        {molecule.linked_reports?.length ? (
                            <ul className="space-y-3">
                                {molecule.linked_reports.map(report => (
                                    <li key={report._id} className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                        <Link to={`/reports/${report._id}`} className="block">
                                            <div className="font-medium text-slate-900">{report.title}</div>
                                            <div className="text-xs text-slate-500 mt-1">Generated {new Date(report.created_at).toLocaleDateString()}</div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-slate-500 italic">No reports generated yet.</p>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <div className="col-span-1 space-y-6">
                    <section className="bg-white p-6 rounded-xl border shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Activity size={20} />
                            Recent Activity
                        </h2>
                        <div className="space-y-4">
                            {molecule.latest_tasks?.length ? molecule.latest_tasks.map(task => (
                                <div key={task.id} className="text-sm border-l-2 border-blue-200 pl-3 py-1">
                                    <div className="font-medium">{task.name}</div>
                                    <div className="text-xs text-slate-500">{task.status} • {task.date}</div>
                                </div>
                            )) : <p className="text-sm text-slate-500">No recent tasks.</p>}
                        </div>
                    </section>

                    <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="font-medium text-slate-900 mb-2">Properties</h3>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Created</dt>
                                <dd className="font-medium">{new Date(molecule.created_at || Date.now()).toLocaleDateString()}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-500">ID</dt>
                                <dd className="font-mono text-xs">{molecule._id?.substring(0, 8)}...</dd>
                            </div>
                            {molecule.smiles && (
                                <div className="pt-2 border-t border-slate-200 mt-2">
                                    <dt className="text-slate-500 mb-1">SMILES</dt>
                                    <dd className="font-mono text-xs break-all bg-white p-2 rounded border border-slate-200 text-slate-600">
                                        {molecule.smiles}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </section>
                </div>
            </div>

            <RequestEvalDialog
                isOpen={isEvalOpen}
                onClose={() => setIsEvalOpen(false)}
                moleculeId={id}
                onSuccess={() => {
                    refetch();
                }}
            />
        </div>
    );
}

export default MoleculeDetailPage;
