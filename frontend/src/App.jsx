import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { MoleculesPage } from './pages/MoleculesPage';
import { MoleculeDetailPage } from './pages/MoleculeDetailPage';
import { IngestionDashboardPage } from './pages/IngestionDashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { AgentTasksPage } from './pages/AgentTasksPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { AgentConfigPage } from './pages/AgentConfigPage';
import { SearchPage } from './pages/SearchPage';
import { ScoreDashboardPage } from './pages/ScoreDashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { ChatPage } from './pages/ChatPage';
import { OpsDashboardPage } from './pages/admin/OpsDashboardPage';
import { LogsPage } from './pages/admin/LogsPage';
import { CrewAIMonitorPage } from './pages/admin/CrewAIMonitorPage';

import { LandingPage } from './pages/LandingPage';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<LandingPage />} />
                        <Route path="dashboard" element={<HomePage />} />

                        <Route path="molecules" element={<MoleculesPage />} />
                        <Route path="molecules/new" element={<MoleculesPage />} /> {/* Opens modal via state handled in page if we want, or simple route */}
                        <Route path="molecules/:id" element={<MoleculeDetailPage />} />

                        <Route path="ingestion" element={<IngestionDashboardPage />} />
                        <Route path="ingestion/documents" element={<DocumentsPage />} />
                        <Route path="ingestion/upload" element={<DocumentsPage />} /> {/* Optional shortcut route, though modal is preferred */}
                        <Route path="ingestion/documents/:id" element={<DocumentDetailPage />} />

                        <Route path="agents/tasks" element={<AgentTasksPage />} />
                        <Route path="agents/tasks/:taskId" element={<TaskDetailPage />} />
                        <Route path="agents/worker/:workerName" element={<AgentConfigPage />} />

                        <Route path="search" element={<SearchPage />} />
                        <Route path="search/results" element={<SearchPage />} />

                        <Route path="scores/:taskId" element={<ScoreDashboardPage />} />

                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="reports/:reportId" element={<ReportsPage />} />

                        <Route path="chat" element={<ChatPage />} />
                        <Route path="chat/:moleculeId" element={<ChatPage />} />

                        <Route path="ops" element={<OpsDashboardPage />} />
                        <Route path="admin/ops" element={<OpsDashboardPage />} />
                        <Route path="admin/logs" element={<LogsPage />} />
                        <Route path="admin/crewai" element={<CrewAIMonitorPage />} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
