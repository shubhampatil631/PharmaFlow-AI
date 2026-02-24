from app.providers.base import BaseProvider
from app.providers.schemas import MoleculeData
from typing import Optional

class PubChemProvider(BaseProvider):
    def __init__(self):
        super().__init__(base_url="https://pubchem.ncbi.nlm.nih.gov/rest/pug")

    async def get_molecule(self, name: str) -> MoleculeData:
        """
        Fetches molecule properties by name.
        """
        try:
            # We request: MolecularFormula, MolecularWeight, IsomericSMILES, CanonicalSMILES, IUPACName
            prop_endpoint = f"/compound/name/{name}/property/MolecularFormula,MolecularWeight,IsomericSMILES,CanonicalSMILES,IUPACName/JSON"
            desc_endpoint = f"/compound/name/{name}/description/JSON"
            syn_endpoint = f"/compound/name/{name}/synonyms/JSON"
            
            import asyncio
            # Fetch all in parallel
            prop_task = self._get(prop_endpoint)
            desc_task = self._get(desc_endpoint)
            syn_task = self._get(syn_endpoint)
            
            # Use return_exceptions=True to allow failures
            results = await asyncio.gather(prop_task, desc_task, syn_task, return_exceptions=True)
            
            prop_data = results[0] if not isinstance(results[0], Exception) else {}
            desc_data = results[1] if not isinstance(results[1], Exception) else {}
            syn_data = results[2] if not isinstance(results[2], Exception) else {}
            
            # Extract properties
            properties = prop_data.get("PropertyTable", {}).get("Properties", [{}])[0]
            
            # Extract Description
            description = None
            info_list = desc_data.get("InformationList", {}).get("Information", [])
            for info in info_list:
                if "Description" in info:
                    description = info["Description"]
                    break
            
            # Extract CAS from Synonyms
            cas_number = None
            synonyms = syn_data.get("InformationList", {}).get("Information", [{}])[0].get("Synonym", [])
            import re
            cas_regex = re.compile(r'^\d{2,7}-\d{2}-\d$')
            for s in synonyms:
                if cas_regex.match(s):
                    cas_number = s
                    break

            cid = properties.get("CID")
            
            # Construct structure URLs if CID is available
            structure_2d = None
            structure_3d = None
            if cid:
                structure_2d = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/PNG"
                structure_3d = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/SDF?record_type=3d"
            
            return MoleculeData(
                name=name,
                cid=cid,
                formula=properties.get("MolecularFormula"),
                molecular_weight=float(properties.get("MolecularWeight", 0)),
                smiles=properties.get("IsomericSMILES") or properties.get("CanonicalSMILES") or properties.get("SMILES"),
                iupac_name=properties.get("IUPACName"),
                cas_number=cas_number,
                structure_2d=structure_2d,
                structure_3d=structure_3d,
                description=description
            )
        except Exception:
            # Return a partial object on failure rather than crashing hard in the agent flow
            # The 'cid' will be None, indicating not found/error
            return MoleculeData(name=name)

    async def get_patents(self, name: str) -> list:
        """
        Fetch patent IDs via PubChem XRefs.
        """
        try:
            # First need CID
            cid_data = await self._get(f"/compound/name/{name}/cids/JSON")
            if not cid_data or "IdentifierList" not in cid_data:
                return []
            
            cids = cid_data["IdentifierList"].get("CID", [])
            if not cids:
                return []
            
            cid = cids[0]
            
            # Fetch XRefs for Patents
            # Note: This can be heavy, restricting to first page or specific view is better if possible.
            # PubChem often links patents via 'Patent' XRef
            xref_endpoint = f"/compound/cid/{cid}/xrefs/PatentID/JSON"
            data = await self._get(xref_endpoint)
            
            if not data or "InformationList" not in data:
                return []
                
            info_list = data["InformationList"].get("Information", [])
            if not info_list:
                return []
                
            patents = info_list[0].get("XRef", [])
            if not patents:
                return []
                
            patent_ids = [p.get("PatentID") for p in patents if "PatentID" in p]
            
            # Filter for diverse set (US, EP, WO) and limit
            filtered = []
            seen = set()
            for pid in patent_ids:
                if pid not in seen:
                    filtered.append(pid)
                    seen.add(pid)
                if len(filtered) >= 10:
                    break
            
            return filtered
        except Exception as e:
            print(f"Error fetching patents for {name}: {e}")
            return []

    async def get_vendors(self, name: str) -> list:
        """
        Fetch chemical vendors (simulated supply chain data source).
        """
        # PubChem doesn't have a direct simple "Vendors" API that is easy to consume without scraping.
        # We will use the presence of CID to return a semi-real list based on common suppliers if the CID exists.
        try:
            chem_data = await self.get_molecule(name)
            # RELAXED CHECK: Allow vendor generation for drug classes (which might not have a single CID)
            # usage of simulated data allows this.
            if not chem_data.name:
                return []
                
            # If compound exists or is a valid class name, it likely has suppliers.
            # We return a placeholder list that claims to be from PubChem Sources.
            # This ensures we don't show "No Vendors" for valid inputs like "Macrolides".
            
            # PubChem often has a "Chemical Vendors" section in its web UI, but the REST API doesn't 
            # always expose the full list easily. To avoid hallucinations, we return an empty list
            # and let the agent report the presence of the molecule in commerce rather than naming fake ones.
            return []
        except Exception:
            return []

# Singleton instance
pubchem_client = PubChemProvider()
