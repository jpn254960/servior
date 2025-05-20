
let s = 0;
let id_tag=''
let bt_tag=''
let HTML= document.body.innerHTML
var controlador=0


window.addEventListener('resize', () => {
  if (window.innerWidth >= 768) {
    document.body.innerHTML = '<h2 id="mensagem_erro">Sistema apenas para mobile</h2>';
  }else{
    document.body.innerHTML=HTML
    s=0
  }

});

function abrir(tarefas,escola,data,ids,n_taf){
    console.log(n_taf)
    controlador=0
    document.getElementById('passivo').className='ativo'
    document.getElementById('escola_p').innerText=escola
    document.getElementById('data_p').innerText=data
    var lista= tarefas.split(',')
    console.log(lista)
    for(c=0;c!=lista.length;c++){
        controlador++
        document.getElementById('bt_envio').onclick= ()=>{
            enviar(ids,n_taf)
        }
        var ele= document.createElement('section')
        ele.className='taf'
        ele.id='taf'
        ele.innerHTML=`
            <h1 id="tarefa">${lista[c]}</h1>
            <select name="" id="select${c}" class="select">
                <option value="pendente" class="op">Pendente</option>
                <option value="andamento" class="op">Andamento</option>
                <option value="concluido" class="op">Concluido</option>
            </select>
            `
        document.getElementById('tarefas_p').appendChild(ele)
    }
}

async function gerar() {
    id_tag=''
    bt_tag=''
    const tarefas = await fetch('/ver/trabalhos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nome: localStorage.getItem('nome')
        })
    });

    const tarefa = await tarefas.json();
    const resultado1 = tarefa.trabalhos
    const resultado2= resultado1[0].trabalhos
    if(resultado2==' ' || resultado2.length==0){
        document.getElementById('painel_tarefa').innerHTML=`<img src="imgs/not_taf.png" alt="sem_taf" id="img_fundo">`
        return
    }
    else{
        document.getElementById('img_fundo').style.animation='aparecer 1s linear reverse'
        document.getElementById('img_fundo').style='display:none'
    }
    const resultado=resultado2
        .trim() 
        .split(/(?=\{)/g)
        .map(str => JSON.parse(str))
    for (let c = s; c < resultado.length; c++) {
        const element=document.createElement('section')
        element.id='tafs'+c
        element.className=resultado[c]['def']
        id_tag=''
        if(['emergencia'].includes(resultado[c]['def'])){
            id_tag='tag_eme'
            bt_tag='bt_eme'
        }else{
            id_tag=''
            bt_tag=''
        }
        var lista= resultado[c]['id'].join(',')
        element.innerHTML=`
                <h1 id="${id_tag}" class="tag">${resultado[c]['def']}</h1>
                <section id='oculto'>
                    <h1 id="escola" class="tags">${resultado[c]['escola']}</h1>
                    <h1 id="data" class="tags">${resultado[c]['data']}</h1>
                    <h1 id="obs" class="txt_oculto">Obs:<br>${resultado[c]['obs']}</h1>
                    <h1 id="tarefas" class="txt_oculto">Tarefas:<br>${resultado[c]['tarefas']}</h1>
                    <h1 class="bt_entregar" id="${bt_tag}" onclick="abrir('${resultado[c]['tarefas']}','${resultado[c]['escola']}','${resultado[c]['data']}','${lista}',${c})">Finalizar</h1>
                </section>`
        element.ondblclick= ()=> {
            buscar(element)
        }
        document.getElementById('painel_tarefa').appendChild(element)
        s++;
    }
}
function buscar(element){
    if ( element.style.height!='70vh'){
        element.style.height='70vh'
        element.style.animation='abrir 1.5s'
    }else{
        element.style.height=''
        element.style.animation='fechar 1.5s'

    }
}

function fechar(){
    document.getElementById('tarefas_p').innerHTML=''
    document.getElementById('passivo').className='desligado'
}

 async function alterar(nome,idsl,statu){
    console.log(nome,' ',statu," ",idsl)
 }



async function enviar(idl,n_taf){   
    const modificar = await fetch('/api/funcionarios')
    var r = await modificar.json()
    for (c=0;c!=r.length;c++){
        if(r[c]['nome']==localStorage.getItem('nome')){
            var lista = r[c]['trabalhos']
            .trim() 
            .split(/(?=\{)/g)
            .map(str => JSON.parse(str))
            lista.splice(n_taf,1)
            // UPDDATE DE LISTA NO BANCO
            var nova_lista=''
            for (x=0;x!=lista.length;x++){
                const stringObj = JSON.stringify(lista[x]);
                nova_lista+=" "+stringObj
            }
            console.log(nova_lista)
        }
    }
    const up= await fetch('/up/trabalhos',{
            method:"POST",
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: localStorage.getItem('nome'),
                tr:nova_lista
            })
            }
    ) 
    var ids=idl.split(',')
    var nome=localStorage.getItem('nome')
    var values=[]
    document.getElementById('tafs'+n_taf).remove()
    for (c=0;c!=ids.length;c++){
        values.push(document.getElementById('select'+c).value)
    }
    const alterar = await fetch('/finalizar', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                 nome: nome,
                 idr: ids,
                 estatuss: values
            })
        })
    s--
    if(alterar.ok){
        fechar()
    }
}
gerar()
setInterval(gerar, 2000);
// PRA CONTINUAR PRA PEGAR O PQ N_TAF É INDEFINE