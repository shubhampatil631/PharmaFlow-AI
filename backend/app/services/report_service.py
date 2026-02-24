import os
import json
from datetime import datetime
from typing import Dict, Any, List
from jinja2 import Template
try:
    from weasyprint import HTML, CSS
    WEASYPRINT_AVAILABLE = True
except OSError:
    WEASYPRINT_AVAILABLE = False
    print("Warning: WeasyPrint not available (GTK missing). PDF generation disabled.")
except ImportError:
    WEASYPRINT_AVAILABLE = False
    print("Warning: WeasyPrint not installed. PDF generation disabled.")
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", "pharmaceutical_agent")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

REPORTS_DIR = "reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

class ReportService:
    def list_reports(self) -> List[Dict[str, Any]]:
        # Query tasks that have 'report_path'
        tasks = db.agent_tasks.find({"report_path": {"$exists": True}}).sort("updated_at", -1)
        reports = []
        for t in tasks:
            file_path = t.get("report_path")
            size_str = "Unknown"
            if file_path and os.path.exists(file_path):
                size_bytes = os.path.getsize(file_path)
                if size_bytes > 1024 * 1024:
                    size_str = f"{size_bytes / (1024 * 1024):.1f} MB"
                else:
                    size_str = f"{size_bytes / 1024:.1f} KB"
            
            reports.append({
                "id": str(t["_id"]), # report ID same as task ID for now
                "taskId": str(t["_id"]),
                "name": f"Analysis Report: {t.get('molecule_name', 'Unknown')}",
                "status": "Ready",
                "size": size_str,
                "generatedBy": "PharmaFlow AI System",
                "date": t.get("updated_at") or t.get("created_at"),
                "path": file_path
            })
        return reports

    def get_report(self, task_id: str) -> Dict[str, Any]:
        task = db.agent_tasks.find_one({"_id": ObjectId(task_id)})
        if not task or "report_path" not in task:
             return None
             
        file_path = task.get("report_path")
        size_str = "Unknown"
        if file_path and os.path.exists(file_path):
            size_bytes = os.path.getsize(file_path)
            if size_bytes > 1024 * 1024:
                size_str = f"{size_bytes / (1024 * 1024):.1f} MB"
            else:
                size_str = f"{size_bytes / 1024:.1f} KB"

        # Note: Assuming API is exposed at /api
        return {
            "id": str(task["_id"]),
            "taskId": str(task["_id"]),
            "name": f"Analysis Report: {task.get('molecule_name', 'Unknown')}",
            "status": "Ready",
            "size": size_str,
            "generatedBy": "PharmaFlow AI System",
            "date": task.get("updated_at") or task.get("created_at"),
            "fileUrl": f"http://localhost:8000/api/reports/download/{task_id}" 
        }

    def generate_report(self, task_id: str) -> str:
        """
        Generates a PDF report for a given task. Returns file path.
        """
        task = db.agent_tasks.find_one({"_id": ObjectId(task_id)})
        if not task:
            raise ValueError("Task not found")
            
        # Prepare Data
        task_result = task.get("result", {})
        data = {
            "title": f"Repurposing Analysis: {task.get('molecule_name')}",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "molecule": task.get("molecule_name"),
            "summary": task_result.get("summary", "No summary available."),
            "recommendation": task_result.get("recommendation", "Recommendation pending more data."),
            "data": task_result.get("data", {}),  # Pass the structured agent data
            "logs": task.get("logs", [])
        }
        
        # HTML Template
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Repurposing Report: {{ molecule }}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
                
                :root {
                    --primary: #0F172A;
                    --secondary: #334155;
                    --accent: #2563EB;
                    --accent-light: #EFF6FF;
                    --text-body: #475569;
                    --border: #E2E8F0;
                }

                @page { margin: 0; size: A4; }
                
                body {
                    font-family: 'Inter', sans-serif;
                    color: var(--text-body);
                    line-height: 1.5;
                    margin: 0;
                    background: #fff;
                    font-size: 10pt;
                }

                .page {
                    position: relative;
                    width: 210mm;
                    margin: 0 auto;
                    background: white;
                    padding: 0;
                    overflow: visible;
                    border-bottom: 1px solid #eee; /* Preview separator */
                    page-break-inside: avoid;
                    page-break-after: always;
                }
                
                @media print {
                    .page { width: 100%; border: none; }
                }

                /* Layouts */
                .content-wrapper { padding: 40px 50px 100px 50px; }
                .cols-2 { display: flex; gap: 40px; justify-content: space-between; }
                .cols-2 > div { flex: 1; box-sizing: border-box; }
                .grid-3 { display: flex; gap: 20px; justify-content: space-between; }
                .grid-3 > div { flex: 1; box-sizing: border-box; }

                /* Text */
                h1 { font-size: 24pt; color: var(--primary); margin: 0; line-height: 1.2; }
                h2 { font-size: 16pt; color: var(--primary); border-bottom: 2px solid var(--border); padding-bottom: 10px; margin-top: 40px; margin-bottom: 25px; page-break-after: avoid; }
                h3 { font-size: 12pt; color: var(--secondary); font-weight: 600; margin-top: 25px; margin-bottom: 10px; page-break-after: avoid; }
                p { margin-bottom: 12px; text-align: justify; }

                /* Components */
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid var(--primary); padding-bottom: 15px; margin-bottom: 30px; }
                .footer { display: flex; justify-content: space-between; font-size: 8pt; color: #94A3B8; border-top: 1px solid var(--border); padding-top: 15px; margin-top: 50px; page-break-inside: avoid; }
                
                table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 20px; }
                th { text-align: left; background: var(--primary); color: white; padding: 10px; font-weight: 500; font-size: 8pt; text-transform: uppercase; }
                td { padding: 10px; border-bottom: 1px solid var(--border); vertical-align: top; }
                tr:nth-child(even) { background: #F8FAFC; }

                .metric-card { background: var(--accent-light); padding: 20px; border-radius: 8px; border-left: 4px solid var(--accent); }
                .metric-val { font-size: 20pt; font-weight: 700; color: var(--primary); margin-top: 5px; }
                .metric-lbl { font-size: 9pt; text-transform: uppercase; color: var(--secondary); font-weight: 600; }

                .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 8pt; font-weight: 600; }
                .tag-green { background: #DCFCE7; color: #166534; }
                .tag-blue { background: #DBEAFE; color: #1E40AF; }
                .tag-red { background: #FEE2E2; color: #991B1B; }

                /* Cover specific */
                .cover { display: flex; min-height: 290mm; page-break-after: always; }
                .cover-side { width: 80mm; flex-shrink: 0; background: var(--primary); color: white; padding: 60px 40px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
                .cover-main { flex: 1; padding: 80px 50px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; }
            </style>
        </head>
        <body>
            
            <!-- PAGE 1: COVER -->
            <div class="page text-gray-900">
                <div class="cover">
                    <div class="cover-side">
                        <div>
                            <div style="font-size: 16pt; font-weight: 700; border-bottom: 2px solid var(--accent); padding-bottom: 20px; margin-bottom: 40px;">PHARMAFLOW INTELLIGENCE</div>
                            <div style="margin-bottom: 30px;">
                                <div style="font-size: 8pt; opacity: 0.7; text-transform: uppercase;">Report Type</div>
                                <div style="font-size: 12pt; font-weight: 500;">Comprehensive Repurposing Scan</div>
                            </div>
                            <div style="margin-bottom: 30px;">
                                <div style="font-size: 8pt; opacity: 0.7; text-transform: uppercase;">Molecule</div>
                                <div style="font-size: 12pt; font-weight: 500;">{{ molecule }}</div>
                            </div>
                            <div>
                                <div style="font-size: 8pt; opacity: 0.7; text-transform: uppercase;">Date</div>
                                <div style="font-size: 12pt; font-weight: 500;">{{ date }}</div>
                            </div>
                        </div>
                        <div style="font-size: 9pt; opacity: 0.5;">Confidential & Proprietary<br>Generated by PharmaFlow AI System</div>
                    </div>
                    <div class="cover-main">
                        <div style="width: 8px; height: 100px; background: var(--accent); margin-bottom: 30px;"></div>
                        <h1 style="font-size: 36pt; letter-spacing: -1px; margin-bottom: 20px; overflow-wrap: break-word; word-break: break-word; line-height: 1.1;">{{ molecule }}</h1>
                        <div style="font-size: 20pt; color: var(--secondary); font-weight: 300;">Strategic Analysis & Market Viability Report</div>
                    </div>
                </div>
            </div>

            <!-- PAGE 2: EXECUTIVE SUMMARY -->
            <div class="page">
                <div class="content-wrapper">
                    <div class="header">
                        <div class="header-title" style="font-size: 20pt; font-weight: 700; color: var(--primary);">Executive Briefing</div>
                        <div style="text-align: right; color: var(--secondary);">Page 2</div>
                    </div>

                    <div class="grid-3" style="margin-bottom: 40px;">
                        {% if data.iqvia and data.iqvia.market_data %}
                        <div class="metric-card">
                            <div class="metric-lbl">Market Maturity</div>
                            <div class="metric-val" style="font-size: 14pt;">{{ data.iqvia.market_data.maturity_stage }}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-lbl">Vendor Availability</div>
                            <div class="metric-val" style="font-size: 14pt;">{{ data.exim.trade_data.active_suppliers if data.exim else 'Unknown' }} Public Vendors</div>
                        </div>
                        {% endif %}
                        <div class="metric-card">
                            <div class="metric-lbl">Patent Status</div>
                            <div class="metric-val" style="font-size: 11pt; margin-top: 12px; line-height: 1.2;">
                                {% if data.patent and data.patent.patent_status and 'Error' not in data.patent.patent_status.status %}
                                    {{ data.patent.patent_status.status }}
                                {% else %}
                                    Analysis Pending
                                {% endif %}
                            </div>
                        </div>
                    </div>

                    <h2>Key Findings</h2>
                    <div style="background: #f8fafc; padding: 25px; border-left: 5px solid var(--primary); margin-bottom: 30px; border-radius: 4px;">
                        <p style="font-size: 11pt; color: #1e293b; white-space: pre-wrap;"><strong>Summary:</strong> {{ summary }}</p>
                    </div>

                    <div class="cols-2">
                        <div>
                            <h3>Strategic Drivers</h3>
                            <ul style="padding-left: 20px;">
                                {% if data.iqvia and data.iqvia.strategic_analysis %}
                                    {% for opp in data.iqvia.strategic_analysis.swot.opportunities[:3] %}
                                    <li style="margin-bottom: 8px;">{{ opp }}</li>
                                    {% endfor %}
                                {% endif %}
                            </ul>
                        </div>
                        <div>
                            <h3>Critical Risks</h3>
                            <ul style="padding-left: 20px; color: #b91c1c;">
                                {% if data.iqvia and data.iqvia.strategic_analysis %}
                                    {% for risk in data.iqvia.strategic_analysis.swot.threats[:3] %}
                                    <li style="margin-bottom: 8px;">{{ risk }}</li>
                                    {% endfor %}
                                {% endif %}
                            </ul>
                        </div>
                    </div>

                    <div class="footer">
                        <div>CONFIDENTIAL • {{ molecule }}</div>
                        <div>Page 2</div>
                    </div>
                </div>
            </div>

            <!-- PAGE 3: MARKET INTELLIGENCE -->
            <div class="page">
                <div class="content-wrapper">
                    <div class="header">
                        <div class="header-title" style="font-size: 20pt; font-weight: 700; color: var(--primary);">Market Intelligence</div>
                        <div style="text-align: right; color: var(--secondary);">Page 3</div>
                    </div>

                    <h2>Market Structure</h2>
                    {% if data.iqvia and data.iqvia.market_data and 'Error' not in data.iqvia.market_data.market_structure %}
                    <p style="font-size: 11pt; border-left: 3px solid var(--accent); padding-left: 15px;">
                        {{ data.iqvia.market_data.market_structure }}
                    </p>
                    {% else %}
                    <p style="font-size: 11pt; border-left: 3px solid var(--accent); padding-left: 15px;">
                        Market structure analysis is currently unavailable due to data retrieval limitations.
                    </p>
                    {% endif %}

                    <h2>Key Global Manufacturers</h2>
                    <p>Major players identified in this therapeutic area:</p>
                    {% if data.iqvia and data.iqvia.market_data.competitors %}
                    <ul style="columns: 2;">
                        {% for comp in data.iqvia.market_data.competitors %}
                        <li style="margin-bottom: 10px; font-weight: 500;">{{ comp.name }}</li>
                        {% endfor %}
                    </ul>
                    {% else %}
                    <p>No major manufacturer verified.</p>
                    {% endif %}

                    <div class="footer">
                        <div>CONFIDENTIAL • {{ molecule }}</div>
                        <div>Page 3</div>
                    </div>
                </div>
            </div>
            
            <!-- PAGE 4: SCIENTIFIC LITERATURE -->
            <div class="page">
                <div class="content-wrapper">
                    <div class="header">
                        <div class="header-title" style="font-size: 20pt; font-weight: 700; color: var(--primary);">Scientific Literature Review</div>
                        <div style="text-align: right; color: var(--secondary);">Page 4</div>
                    </div>

                    <h2>Key Publications</h2>
                    <p>The following peer-reviewed articles were identified as high-relevance for the repurposing hypothesis:</p>
                    
                    {% if data.web and data.web.scientific_publications %}
                        {% for paper in data.web.scientific_publications %}
                        <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                            <div style="font-weight: 600; color: var(--accent); margin-bottom: 4px;">{{ paper.title }}</div>
                            <div style="font-size: 8pt; color: #64748B; margin-bottom: 6px;">{{ paper.journal }} • {{ paper.year }} • PMID: {{ paper.pmid }}</div>
                            <div style="font-size: 9pt; color: #334155; font-style: italic;">“{{ paper.abstract | default('', true) | truncate(200) }}”</div>
                        </div>
                        {% endfor %}
                    {% else %}
                        <p>No publications found.</p>
                    {% endif %}

                    <div class="footer">
                        <div>CONFIDENTIAL • {{ molecule }}</div>
                        <div>Page 4</div>
                    </div>
                </div>
            </div>

            <!-- PAGE 5: CLINICAL TRIALS -->
            <div class="page">
                <div class="content-wrapper">
                    <div class="header">
                        <div class="header-title" style="font-size: 20pt; font-weight: 700; color: var(--primary);">Clinical Development</div>
                        <div style="text-align: right; color: var(--secondary);">Page 5</div>
                    </div>

                    <h2>Active & Recruiting Trials</h2>
                    {% if data.clinical and data.clinical.latest_trials %}
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40%">Study Title</th>
                                <th>NCT ID</th>
                                <th>Phase</th>
                                <th>Status</th>
                                <th>Conditions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {% for trial in data.clinical.latest_trials %}
                            <tr>
                                <td>{{ trial.title | default('', true) | truncate(70) }}</td>
                                <td><a href="{{ trial.url }}" target="_blank" style="color: var(--accent); text-decoration: none;">{{ trial.nct_id }}</a></td>
                                <td>{{ trial.phase or 'N/A' }}</td>
                                <td>
                                    <span class="tag {{ 'tag-green' if trial.status == 'Recruiting' else 'tag-blue' }}">{{ trial.status }}</span>
                                </td>
                                <td>{{ trial.conditions | default([], true) | join(", ") | truncate(40) }}</td>
                            </tr>
                            {% endfor %}
                        </tbody>
                    </table>
                    {% endif %}
                    
                    <h2>Recruitment Analysis</h2>
                    <p>Overview of the current recruitment status across identified studies.</p>
                    {% if data.clinical and data.clinical.recruitment_breakdown %}
                    <ul>
                        {% for status, count in data.clinical.recruitment_breakdown.items() %}
                        <li><strong>{{ status }}:</strong> {{ count }} studies</li>
                        {% endfor %}
                    </ul>
                    {% endif %}

                    <div class="footer">
                        <div>CONFIDENTIAL • {{ molecule }}</div>
                        <div>Page 5</div>
                    </div>
                </div>
            </div>

            <!-- PAGE 6: PATENT LANDSCAPE -->
            <div class="page">
                <div class="content-wrapper">
                    <div class="header">
                        <div class="header-title" style="font-size: 20pt; font-weight: 700; color: var(--primary);">Intellectual Property & Legal</div>
                        <div style="text-align: right; color: var(--secondary);">Page 6</div>
                    </div>

                    <h2>Core Patent Status</h2>
                    {% if data.patent and data.patent.patent_status %}
                    <div style="background: #F8FAFC; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                        <div class="cols-2">
                            <div>
                                <div class="metric-lbl">Primary Patent</div>
                                <div style="font-size: 12pt; font-weight: 600;">{{ data.patent.patent_status.primary_patent }}</div>
                            </div>
                            <div>
                                <div class="metric-lbl">Expiry</div>
                                <div style="font-size: 12pt; font-weight: 600;">{{ data.patent.patent_status.expiry_year }}</div>
                            </div>
                        </div>
                    </div>
                    {% endif %}

                    <h3>Patent Family Landscape</h3>
                    {% if data.patent and data.patent.patent_families %}
                    <table>
                        <thead>
                            <tr>
                                <th>Family ID</th>
                                <th>Title/Subject</th>
                                <th>Assignee</th>
                                <th>Expiry</th>
                                <th>Relevance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {% for fam in data.patent.patent_families %}
                            <tr>
                                <td>{{ fam.family_id }}</td>
                                <td>{{ fam.title }}</td>
                                <td>{{ fam.assignee }}</td>
                                <td>{{ fam.expiry }}</td>
                                <td>
                                    <span class="tag {{ 'tag-red' if fam.relevance == 'High' else 'tag-blue' }}">{{ fam.relevance }}</span>
                                </td>
                            </tr>
                            {% endfor %}
                        </tbody>
                    </table>
                    {% endif %}
                    
                     <h3>Claims Analysis</h3>
                    {% if data.patent and data.patent.claims_analysis %}
                    <ul>
                    {% for claim in data.patent.claims_analysis %}
                        <li style="margin-bottom: 8px;">
                            <strong>{{ claim.type }}:</strong> {{ claim.status }} — <span style="font-style: italic;">{{ claim.scope }}</span>
                        </li>
                    {% endfor %}
                    </ul>
                    {% endif %}

                    <div class="footer">
                        <div>CONFIDENTIAL • {{ molecule }}</div>
                        <div>Page 6</div>
                    </div>
                </div>
            </div>

            <!-- PAGE 7: SUPPLY CHAIN -->
            <div class="page">
                <div class="content-wrapper">
                    <div class="header">
                        <div class="header-title" style="font-size: 20pt; font-weight: 700; color: var(--primary);">Global Supply Chain</div>
                        <div style="text-align: right; color: var(--secondary);">Page 7</div>
                    </div>

                   <h2>Registered Vendors (PubChem)</h2>
                   <p>Publicly listed chemical vendors and suppliers:</p>
                   {% if data.exim and data.exim.supplier_tiers %}
                   <table>
                        <thead>
                            <tr>
                                <th>Vendor Name</th>
                                <th>Source Type</th>
                                <th>Verified</th>
                            </tr>
                        </thead>
                        <tbody>
                            {% for vendor in data.exim.supplier_tiers[:15] %}
                            <tr>
                                <td style="font-weight: 600;">{{ vendor.name }}</td>
                                <td>{{ vendor.tier }}</td>
                                <td>
                                    <span class="tag tag-gray">{{ vendor.audit_status }}</span>
                                </td>
                            </tr>
                            {% endfor %}
                        </tbody>
                   </table>
                   {% else %}
                   <p>No public vendor data available.</p>
                   {% endif %}



                    <div class="footer">
                        <div>CONFIDENTIAL • {{ molecule }}</div>
                        <div>Page 7</div>
                    </div>
                </div>
            </div>

            <!-- PAGE 8: STRATEGIC CONCLUSIONS -->
            <div class="page">
                <div class="content-wrapper">
                    <div class="header">
                        <div class="header-title" style="font-size: 20pt; font-weight: 700; color: var(--primary);">Strategic Conclusions</div>
                        <div style="text-align: right; color: var(--secondary);">Page 8</div>
                    </div>

                    <h2>SWOT Analysis</h2>
                    {% if data.iqvia and data.iqvia.strategic_analysis %}
                    <div class="cols-2" style="margin-bottom: 30px;">
                        <div style="background: #f1f5f9; padding: 20px; border-radius: 4px;">
                            <h3 style="margin-top:0; color: #0f172a;">Strengths</h3>
                            <ul style="margin: 0; padding-left: 20px;">
                                {% for s in data.iqvia.strategic_analysis.swot.strengths %}<li>{{ s }}</li>{% endfor %}
                            </ul>
                        </div>
                        <div style="background: #fff1f2; padding: 20px; border-radius: 4px;">
                            <h3 style="margin-top:0; color: #991b1b;">Weaknesses</h3>
                            <ul style="margin: 0; padding-left: 20px;">
                                {% for w in data.iqvia.strategic_analysis.swot.weaknesses %}<li>{{ w }}</li>{% endfor %}
                            </ul>
                        </div>
                         <div style="background: #f0fdf4; padding: 20px; border-radius: 4px;">
                            <h3 style="margin-top:0; color: #166534;">Opportunities</h3>
                            <ul style="margin: 0; padding-left: 20px;">
                                {% for o in data.iqvia.strategic_analysis.swot.opportunities %}<li>{{ o }}</li>{% endfor %}
                            </ul>
                        </div>
                         <div style="background: #fefce8; padding: 20px; border-radius: 4px;">
                            <h3 style="margin-top:0; color: #854d0e;">Threats</h3>
                            <ul style="margin: 0; padding-left: 20px;">
                                {% for t in data.iqvia.strategic_analysis.swot.threats %}<li>{{ t }}</li>{% endfor %}
                            </ul>
                        </div>
                    </div>
                    {% endif %}

                    <h2>Final Recommendation</h2>
                    <div style="background: #f8fafc; padding: 25px; border-radius: 8px; border-left: 5px solid var(--accent); margin-bottom: 30px;">
                        <p style="font-size: 11pt; line-height: 1.6; color: #1e293b; margin: 0; white-space: pre-wrap;">
                            {{ recommendation }}
                        </p>
                    </div>

                    <div style="margin-top: 60px; border-top: 1px solid #ccc; padding-top: 20px; display: flex; justify-content: space-between;">
                        <div>
                            <strong>Approved By:</strong><br><br>__________________________<br>Chief Scientific Officer
                        </div>
                        <div>
                            <strong>Date:</strong><br><br>__________________________
                        </div>
                    </div>

                    <div class="footer">
                        <div>CONFIDENTIAL • {{ molecule }}</div>
                        <div>Page 8</div>
                    </div>
                </div>
            </div>

        </body>
        </html>
        """
        
        # Render
        template = Template(html_template)
        html_content = template.render(**data)
        
        # Save HTML (Force fallback for Windows MVP stability)
        filename = f"report_{task_id}.html"
        file_path = os.path.join(REPORTS_DIR, filename)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)
            
        print(f"Report saved to {file_path}")
        
        # Optional PDF Generation if available
        if WEASYPRINT_AVAILABLE:
            try:
                pdf_path = file_path.replace('.html', '.pdf')
                HTML(string=html_content).write_pdf(pdf_path)
                # Update DB with PDF path if successful, or keep HTML path as primary?
                # For now, let's keep HTML as primary for stability, but create PDF as bonus.
            except Exception as e:
                print(f"PDF Generation failed even though WeasyPrint was imported: {e}")
        
        # Update Task
        db.agent_tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": {"report_path": file_path}}
        )
        
        return file_path


    def delete_report(self, report_id: str) -> bool:
        """
        Deletes a report file and removes reference from task.
        """
        # report_id is task_id in this MVP structure
        task = db.agent_tasks.find_one({"_id": ObjectId(report_id)})
        if not task:
            return False
            
        file_path = task.get("report_path")
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error removing file {file_path}: {e}")
                
        # Update Task to remove report path
        result = db.agent_tasks.update_one(
            {"_id": ObjectId(report_id)},
            {"$unset": {"report_path": ""}}
        )
        return result.modified_count > 0

report_service = ReportService()
