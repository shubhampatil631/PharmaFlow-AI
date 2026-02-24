from app.providers.base import BaseProvider
from app.providers.schemas import TargetAssociation
from typing import List

class OpenTargetsProvider(BaseProvider):
    def __init__(self):
        super().__init__(base_url="https://api.platform.opentargets.org/api/v4/graphql")

    async def get_associated_targets(self, disease_id: str) -> List[TargetAssociation]:
        """
        Get targets associated with a disease (EFO ID).
        Example EFO ID: EFO_0000384 (Crohn's disease)
        """
        query = """
        query targetDisease($disease: String!) {
          disease(efoId: $disease) {
            associatedTargets {
              rows {
                target {
                  approvedSymbol
                  approvedName
                }
                score
                datatypeScores {
                  id
                  score
                }
              }
            }
          }
        }
        """
        
        try:
            response = await self._post("", json_data={
                "query": query,
                "variables": {"disease": disease_id}
            })
            
            results = []
            data = response.get("data", {}).get("disease", {})
            if data and "associatedTargets" in data:
                rows = data["associatedTargets"].get("rows", [])
                for row in rows:
                    target = row.get("target", {})
                    results.append(TargetAssociation(
                        target_symbol=target.get("approvedSymbol"),
                        target_name=target.get("approvedName"),
                        score=row.get("score"),
                        datatypes_count=len(row.get("datatypeScores", []))
                    ))
            
            return results
        except Exception as e:
            print(f"Error in OpenTargets search: {e}")
            return []

    async def get_targets_for_drug(self, drug_name: str) -> List[TargetAssociation]:
        """
        Get targets associated with a drug name via mechanisms of action.
        """
        # Simplified query without variables to avoid potential passing issues
        query = f"""
        {{
          search(queryString: "{drug_name}") {{
            hits {{
              id
              object {{
                ... on Drug {{
                  mechanismsOfAction {{
                    rows {{
                      targets {{
                        approvedSymbol
                        approvedName
                      }}
                    }}
                  }}
                }}
              }}
            }}
          }}
        }}
        """
        
        try:
            response = await self._post("", json_data={
                "query": query
            })
            
            results = []
            hits = response.get("data", {}).get("search", {}).get("hits", [])
            
            if hits:
                # Take the first best match
                drug_obj = hits[0].get("object", {})
                mech_rows = drug_obj.get("mechanismsOfAction", {}).get("rows", [])
                
                # Deduplicate targets by symbol
                seen_targets = set()
                
                for row in mech_rows:
                    targets = row.get("targets", [])
                    for t in targets:
                        symbol = t.get("approvedSymbol")
                        if symbol and symbol not in seen_targets:
                            seen_targets.add(symbol)
                            results.append(TargetAssociation(
                                target_symbol=symbol,
                                target_name=t.get("approvedName"),
                                score=1.0, # Mechanism implication is strong
                                datatypes_count=1
                            ))
            
            return results
        except Exception as e:
            print(f"Error in OpenTargets drug search: {e}")
            return []

opentargets_client = OpenTargetsProvider()
