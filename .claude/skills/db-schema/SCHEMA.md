# DB Schema — 21 tables + alerts_view

Chaque table : id UUID PK gen_random_uuid(), created_at, updated_at, created_by FK auth.users

## Enums
sop_status(Planifié,En cours,Validé,En révision,Archivé) capa_status(Ouverte,En cours,Vérification efficacité,Clôturée) capa_source(Audit,Réclamation,Vigilance,Auto-évaluation,Revue direction,Terrain) capa_type(Non-conformité,Action corrective,Action préventive,Amélioration,Anomalie,Near miss) audit_status(Planifié,En cours,Réalisé,Reporté,Annulé) risk_level(Acceptable,Surveillance,Inacceptable) process_type(Management,Réalisation,Support)

## Tables (champs complets dans docs/context.json)
domains(name,process_type) staff(name,role,cluster,email,active) staff_pins(staff_id FK,pin_hash,locked,failed_attempts) sops(code,title,domain_id FK,owner,status,version,validated_at,next_revision,notes) capas(source,type,domain_id FK,description,root_cause,action,owner,due_date,status,closed_at,efficacy_check,efficacy_result,created_by FK,terrain_zone,terrain_severity,terrain_photo_url) audits(type,domain_id FK,reference,auditor,planned_at,completed_at,status,major_findings,minor_findings,observations,strengths,summary) audit_findings(audit_id FK,type,clause_ref,description,capa_id FK) risks(domain_id FK,description,causes,consequences,probability,gravity,detectability,criticality CALC,level CALC,mitigation,owner,review_due,residual_p,residual_g,residual_d,residual_crit CALC) vigilances(type,product,lot,severity,declared_ansm,ansm_ref,measures,capa_id FK,status) recalls(source,product,lots,action,quantity,status) qualifications(staff_id FK,skill_name,obtained_at,expires_at,status) trainings(staff_id FK,title,type,planned_at,completed_at,evaluation,next_due) equipment(name,category,brand_model,serial_no,location,commissioned_at,status,criticality) maintenance(equipment_id FK,type,frequency,last_done_at,next_due_at,provider,status CALC,result,certificate_ref) suppliers(name,type,category,contract,last_eval_at,eval_score,rgpd_clause,hds_compliant) supplier_events(supplier_id FK,type,description,action,capa_id FK) complaints(source,ehpad_name,category,severity,owner,responded_at,status,satisfaction,capa_id FK) indicators(label,target,unit,direction,source_tab) indicator_values(indicator_id FK,period,value) reviews(date,participants,status,context_notes,resource_notes,improvement) review_actions(review_id FK,decision,action,owner,due_date,status,followup_notes)

## Triggers
updated_at auto toutes tables. risks: criticality=P*G*D, level=Inacceptable(>=60)/Surveillance(>=24)/Acceptable, residual_crit

## alerts_view UNION ALL
CAPA due_date<today+status!='Clôturée'→red | qualifications expires_at<today+30→amber | maintenance next_due<today→red | sops next_revision<today+status='Validé'→amber | complaints status='Ouverte'+created_at<now()-48h→red | vigilances severity='Grave'+declared_ansm='Non'→red
