module.exports = async (db, params) => {
    try {
        // insert the code here
        const v_cnpj_cert = params?.empresa?.split('|')[0] ?? '',
            v_insc_estadual = params?.empresa?.split('|')[1] ?? '',
            v_qtd_emp = params?.empresa?.split('|')[2] ?? '',
            v_filtro_manifesto = params?.v_filtro_manifesto ?? '',
            v_filtro_dt_in = params?.data_ini ?? '',
            v_filtro_dt_fim = params?.data_fim ?? '',
            v_filtro_ano_in = v_filtro_dt_in.substr(0, 4) ?? '',
            v_filtro_ano_fim = v_filtro_dt_fim.substr(0, 4) ?? ''

        let destIe = ` and dest.ie = ${v_insc_estadual}`;
            
        if (v_insc_estadual == 'ISENTO' || v_insc_estadual == '') {
            destIe = ` and dest.ie is null `;
        }

        let v_tipo = params?.v_tipo ?? '',
            v_filtro_cpf_cnpj = params?.v_filtro_cpf_cnpj ?? ''

        if (v_insc_estadual.length >= 7 || v_insc_estadual == 'ISENTO' || v_insc_estadual == '') {
            if (v_cnpj_cert.length  == 14) {
                v_tipo = `AND ((ide.tpnf = 1 and dest.cnpj_cpf = '${v_cnpj_cert}' and (dest.cnpj_cpf_tipo = 0 OR dest.cnpj_cpf_tipo = 2)) or (ide.tpnf in (0, 3) and emit.cnpj_cpf = '${v_cnpj_cert}' and (emit.cnpj_cpf_tipo = 0 OR emit.cnpj_cpf_tipo = 2))) `;
            } else if (v_qtd_emp == 1) {
                v_tipo = `AND ((ide.tpnf = 1 and dest.cnpj_cpf = '${v_cnpj_cert}' and dest.cnpj_cpf_tipo = 1) or (ide.tpnf in (0, 3) and dest.cnpj_cpf = '${v_cnpj_cert}')) ${destIe} `;
            } else if (v_insc_estadual.length >= 7) {
                v_tipo = `AND ((ide.tpnf = 1 and dest.cnpj_cpf = '${v_cnpj_cert}' and dest.cnpj_cpf_tipo = 1) or (ide.tpnf in (0, 3) and emit.ie = '${v_insc_estadual}')) ${destIe} `;
            } else {
                v_tipo = `AND (ide.tpnf = 1 and dest.cnpj_cpf = '${v_cnpj_cert}' and dest.cnpj_cpf_tipo = 1 ${destIe})`;
            }
        } else {
            if (v_cnpj_cert.length == 14) {
                v_tipo = `AND ((ide.tpnf = 1 and dest.cnpj_cpf = '${v_cnpj_cert}' and (dest.cnpj_cpf_tipo = 0 OR dest.cnpj_cpf_tipo = 2)) or (ide.tpnf in (0, 3) and emit.cnpj_cpf = '${v_cnpj_cert}' and (emit.cnpj_cpf_tipo = 0 OR emit.cnpj_cpf_tipo = 2)))`;
            } else if (v_qtd_emp == 1) {
                v_tipo = `AND ((ide.tpnf = 1 and dest.cnpj_cpf = '${v_cnpj_cert}' and dest.cnpj_cpf_tipo = 1) or (ide.tpnf in (0, 3) and emit.cnpj_cpf = '${v_cnpj_cert}' and emit.cnpj_cpf_tipo = 1))`;
            } else {
                v_tipo = `AND (ide.tpnf = 1 and dest.cnpj_cpf = '${v_cnpj_cert}' and dest.cnpj_cpf_tipo = 1 ${destIe})`;
            }
        }

        switch (v_filtro_cpf_cnpj) {
            case 'T':
                v_filtro_cpf_cnpj = "<> ''";
                break;
            case 'F':
                v_filtro_cpf_cnpj = " = 'F'";
                break;
            case 'J':
                v_filtro_cpf_cnpj = " = 'J'";
                break;
            default:
                v_filtro_cpf_cnpj = "";
                break;
        }

        const sql = `SELECT tab_temp.tipo_check_ico, tab_temp.tipo_check_cor, tab_temp.tipo_check_bcor, tab_temp.nfe_chave, tab_temp.nfe_serie, tab_temp.nfe_num, tab_temp.ano,
            tab_temp.dt_emit, tab_temp.dt_emit_order, tab_temp.uf, tab_temp.chave_01, tab_temp.chave_02, tab_temp.chave_03, tab_temp.nfe_tipo, tab_temp.cnpj,
            tab_temp.razao_social_nfe, tab_temp.tipo, tab_temp.tipo_pessoa, tab_temp.vicms, tab_temp.vnf, tab_temp.manifesto, tab_temp.nfe_manifesto, tab_temp.refnfp_ie,
            tab_temp.dt_ultima_analise, tab_temp.analise_texto, tab_temp.analise_status
            from (select
            case listaanalises.analise_status when '-' then '<i class=\"fa fa-pencil-square-o fa-2x\" aria-hidden=\"true\"></i>' when 'S' then '<i class=\"fa fa-check-square-o fa-2x\" aria-hidden=\"true\"></i>' when 'P' then '<i class=\"fa fa-minus-square fa-2x\" aria-hidden=\"true\"></i>' else '<i class=\"fa fa-exclamation-triangle fa-2x\" aria-hidden=\"true\"></i>' end as tipo_check_ico,
            case listaanalises.analise_status when '-' then 'black' when 'S' then '#006400' when 'P' then '#C85A53' else '#B8860B' end as tipo_check_cor,
            case listaanalises.analise_status when '-' then 'white' when 'S' then '#F0FFF0' when 'P' then '#FFF5EE' else '#FFFAF0' end as tipo_check_bcor,
            nfe.chave as nfe_chave,
            substring(LPAD(cast(nfe.chave as varchar), 44, '0'),23,3) as nfe_serie,
            substring(LPAD(cast(nfe.chave as varchar), 44, '0'),26,9) as nfe_num,    
            extract(year from ide.dhemi) ano,
            TO_CHAR(ide.dhemi, 'DD/MM/YYYY') AS dt_emit,
            ide.dhemi as dt_emit_order,
            substring(LPAD(cast(nfe.chave as varchar), 44, '0'),0,16) as chave_01,
            substring(LPAD(cast(nfe.chave as varchar), 44, '0'),16,15) as chave_02,
            substring(LPAD(cast(nfe.chave as varchar), 44, '0'),31,44) as chave_03,
            ide.tpnf as nfe_tipo,
            case
            when ide.tpnf in (0, 3) and dest.cnpj_cpf > 0 and (dest.cnpj_cpf_tipo = 0 OR dest.cnpj_cpf_tipo = 2) then 'J'
            when ide.tpnf in (0, 3) and dest.cnpj_cpf > 0 and dest.cnpj_cpf_tipo = 1 then 'F'
            when ide.tpnf = 1 and dest.cnpj_cpf > 0 and (dest.cnpj_cpf_tipo = 0 OR dest.cnpj_cpf_tipo = 2) then 'J' else 'F' 
            end as tipo_pessoa,  
            case
            --caso seja entrada--------------
            when ide.tpnf in (0, 3) and emit.cnpj_cpf = '${v_cnpj_cert}' and dest.cnpj_cpf > 0 and (dest.cnpj_cpf_tipo = 0 OR dest.cnpj_cpf_tipo = 2) then dest.cnpj_cpf
            when ide.tpnf in (0, 3) and emit.cnpj_cpf = '${v_cnpj_cert}' and dest.cnpj_cpf > 0 and dest.cnpj_cpf_tipo = 1 then dest.cnpj_cpf
            when ide.tpnf = 1 and dest.cnpj_cpf = '${v_cnpj_cert}' and emit.cnpj_cpf > 0 and (emit.cnpj_cpf_tipo = 0 OR emit.cnpj_cpf_tipo = 2) then emit.cnpj_cpf
            when ide.tpnf = 1 and dest.cnpj_cpf = '${v_cnpj_cert}' and emit.cnpj_cpf > 0 and emit.cnpj_cpf_tipo = 1 then emit.cnpj_cpf
            --caso seja saida-----------------
            when ide.tpnf = 1 and emit.cnpj_cpf = '${v_cnpj_cert}' and dest.cnpj_cpf > 0 and (dest.cnpj_cpf_tipo = 0 OR dest.cnpj_cpf_tipo = 2) then dest.cnpj_cpf
            when ide.tpnf = 1 and emit.cnpj_cpf = '${v_cnpj_cert}' and dest.cnpj_cpf > 0 and dest.cnpj_cpf_tipo = 1 then dest.cnpj_cpf
            end as cnpj,
            --razao social--------------------
            case
            when ide.tpnf = 1 and emit.cnpj_cpf = '${v_cnpj_cert}' then dest.xnome
            when ide.tpnf in (0, 3) and emit.cnpj_cpf = '${v_cnpj_cert}' then dest.xnome else emit.xnome
            end as razao_social_nfe,
            case when ide.tpnf in (0, 3) then 'ENTRADA' else 'SAÍDA' end AS tipo, toticms.vicms as vicms, toticms.vnf as vnf, listamanifesto.nfe_status as manifesto, resumo.status_manifesto as nfe_manifesto,
            case when ide.tpnf = 1 and emit.cnpj_cpf = '${v_cnpj_cert}' then cast(dest.ie as varchar) else cast(emit.ie as varchar) end as refnfp_ie,
            TO_CHAR(analises.data_hora, 'DD/MM/YYYY') AS dt_ultima_analise, analises.analise_texto, listaanalises.analise_status, emit.uf
            from db_adm_fiscal.t_nfe_infnfe nfe
            left join db_adm_fiscal.t_nfe_analises analises
            ON analises.id = (
                select id from db_adm_fiscal.t_nfe_analises tna
                where tna.chave = nfe.chave
                order by tna.id desc limit 1
            )
            left join db_adm_fiscal.t_nfe_lista_analise listaanalises on (
            CASE
                WHEN 
                    nfe.analise_status is not null
                THEN 
                    listaanalises.id = cast(nfe.analise_status as integer)
                ELSE
                    listaanalises.id = 4
            END
            )
            join db_adm_fiscal.t_nfe_identificacao ide on ide.chave = nfe.chave
            join db_adm_fiscal.t_nfe_destinatario dest on dest.id_dest = nfe.id_dest
            join db_adm_fiscal.t_nfe_emitente emit on emit.id_emit = nfe.id_emit
            join db_adm_fiscal.t_nfe_total_icms toticms on toticms.chave = nfe.chave
            left join db_adm_fiscal.t_nfe_resumo resumo on resumo.chnfe = nfe.chave
            left join db_adm_fiscal.t_nfe_lista_manifesto listamanifesto on listamanifesto.id = resumo.status_manifesto
            left join db_adm_fiscal.t_nfe_doc_fiscal_ref docfiscal on docfiscal.chave = nfe.chave
            where ide.dhemi BETWEEN '${v_filtro_dt_in}' AND '${v_filtro_dt_fim}' ${v_tipo}
            GROUP BY listaanalises.analise_status, analise_texto, analises.data_hora, nfe.chave, ide.dhemi, ide.tpnf,
            dest.cnpj_cpf, dest.cnpj_cpf_tipo, emit.cnpj_cpf, emit.cnpj_cpf_tipo, dest.xnome, emit.xnome, toticms.vicms,
            toticms.vnf, listamanifesto.nfe_status, resumo.status_manifesto, dest.ie, emit.ie, emit.uf
            ) as tab_temp
            where tab_temp.tipo_pessoa ${v_filtro_cpf_cnpj} ORDER BY dt_emit desc`

        let v_dados = await db.raw(sql)
        console.log(v_dados)
        v_dados = v_dados.rows

        const v_dados_formato_front = []

        if (v_dados?.length > 0) {
            v_dados.forEach(row => {
                let v_cnpj_format = ""
                let v_tipo_cnpj_cpf = ""

                if (row["cnpj"]?.length <= 11) {
                    v_cnpj_format = row["cnpj"].toString()?.padStart(11, '0')
                    v_tipo_cnpj_cpf = "CPF"
                } else {
                    v_cnpj_format = row["cnpj"].toString()?.padStart(14, '0')
                    v_tipo_cnpj_cpf = "CNPJ"
                }

                v_dados_formato_front.push({
                    "tipo_check_cor": row["tipo_check_cor"],
                    "tipo_check_bcor": row["tipo_check_bcor"],
                    "tipo_check_ico": row["tipo_check_ico"],
                    "razao_social_nfe": row["razao_social_nfe"],
                    "ano": row["ano"].toString()?.substr(0, 4),
                    "dt_emit": row["dt_emit"],
                    "chave": row["nfe_chave"],
                    "num_nfe": row["nfe_num"],
                    "serie_nfe": row["nfe_serie"],
                    "chave_01": row["chave_01"],
                    "chave_02": row["chave_02"],
                    "chave_03": row["chave_03"],
                    "cnpj": v_cnpj_format,
                    "v_tipo_cnpj_cpf": v_tipo_cnpj_cpf,
                    "nfe_tipo": row["nfe_tipo"],
                    "tipo": row["tipo"],
                    "vicms": row["vicms"].toString()?.padStart(3, '0'),
                    "vnf": parseFloat(row["vnf"]).toFixed(2),
                    "cod_manifesto": row["nfe_manifesto"],
                    "refnfp_ie": row["refnfp_ie"],
                    "manifesto": row["manifesto"],
                    "uf": row["uf"]
                })  
            })
        }

        return v_dados_formato_front

        return {
            msg: 'list'
        }
    } catch (error) {
        return {
            error
        }
    }
}