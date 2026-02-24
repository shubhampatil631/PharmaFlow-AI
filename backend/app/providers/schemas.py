from pydantic import BaseModel, Field
from typing import List, Optional

# --- Molecule Data (PubChem) ---
class MoleculeData(BaseModel):
    name: str = Field(..., description="Name of the molecule")
    formula: Optional[str] = Field(None, description="Molecular formula")
    molecular_weight: Optional[float] = Field(None, description="Molecular weight in g/mol")
    smiles: Optional[str] = Field(None, description="Isomeric SMILES string")
    cid: Optional[int] = Field(None, description="PubChem Compound ID")
    cas_number: Optional[str] = Field(None, description="CAS Registry Number")
    iupac_name: Optional[str] = Field(None, description="IUPAC Name")
    structure_2d: Optional[str] = Field(None, description="URL for 2D structure image")
    structure_3d: Optional[str] = Field(None, description="URL for 3D structure SDF")
    description: Optional[str] = Field(None, description="Brief description from source")
    targets: List["TargetAssociation"] = Field(default_factory=list, description="Target associations")
    bioactivity: List["BioactivityData"] = Field(default_factory=list, description="Bioactivity data")

# --- Literature Data (PubMed/Europe PMC) ---
class LiteratureResult(BaseModel):
    title: str = Field(..., description="Title of the paper")
    abstract: Optional[str] = Field(None, description="Abstract text")
    journal: Optional[str] = Field(None, description="Journal name")
    year: Optional[int] = Field(None, description="Publication year")
    pmid: Optional[str] = Field(None, description="PubMed ID")
    doi: Optional[str] = Field(None, description="Digital Object Identifier")

# --- Clinical Trial Data (ClinicalTrials.gov) ---
class ClinicalTrial(BaseModel):
    nct_id: Optional[str] = Field(None, description="NCT ID")
    title: Optional[str] = Field(None, description="Brief title of the study")
    phase: Optional[str] = Field(None, description="Phase of the trial")
    status: Optional[str] = Field(None, description="Overall recruitment status")
    conditions: List[str] = Field(default_factory=list, description="Conditions listed in the trial")
    url: Optional[str] = Field(None, description="Link to the trial")

# --- Target Association (OpenTargets) ---
class TargetAssociation(BaseModel):
    target_symbol: str = Field(..., description="Target gene symbol")
    target_name: Optional[str] = Field(None, description="Full target name")
    score: float = Field(..., description="Association score (0-1)")
    datatypes_count: Optional[int] = Field(None, description="Number of supporting data types")

# --- Bioactivity (ChEMBL) ---
class BioactivityData(BaseModel):
    target_chembl_id: Optional[str] = Field(None, description="ChEMBL ID of the target")
    target_name: Optional[str] = Field(None, description="Name of the target")
    standard_type: Optional[str] = Field(None, description="Type of measurement (e.g., IC50)")
    standard_value: Optional[float] = Field(None, description="Measured value")
    standard_units: Optional[str] = Field(None, description="Units of measurement (e.g., nM)")
