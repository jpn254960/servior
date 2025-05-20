var quantidade_de_tarefas=0
var tarefas_apagadas=[]
var lista_de_add=[]
var lista_adicionados=[]
var func=[]
let top1=62
var form=[]
var list2=[]
var key=0
var ct=0
var valor=true
let controle=0
var entrada=0
var lista=[0,0,0,0]
var statu=true
var atual='tela_inicio'
var ids=[]
let imagensAtuais = [];
let indexAtual = 0;
let inutil=0
var tarefas=[]
let nome_escola=''
var imgs_serviços='fghjk'
let ser=0
var limitador_alertas=0

const publicKey = 'BMURfov6YsKH8aD9cdyqVG8TJEdlnu7Vgq_9buQnLm-E5D-akX7m713T7UCR7plus2RSOmi1XEtSvzLgX91HE8Y';

async function unsubscribePush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    const success = await subscription.unsubscribe();
    if (success) {
      console.log('Inscrição cancelada com sucesso!');
      // Aqui você pode avisar seu servidor que a inscrição foi cancelada
    } else {
      console.log('Falha ao cancelar a inscrição.');
    }
  } else {
    console.log('Nenhuma inscrição ativa encontrada.');
  }
}


async function subscribe() {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
    alert('Você precisa permitir notificações.');
    return;
    }

    const reg = await navigator.serviceWorker.register('/sw.js');
    const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
    });


    fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify(sub),
    headers: { 'Content-Type': 'application/json' }
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}




function teste(){
    var valor = document.getElementById('select_class').value
    if(valor=='Diretora'){
        document.getElementById('escola').className='ligado_escola'
        void document.getElementById('escola').offsetWidth
        document.getElementById('escola').disabled=false;
    }else{
        void document.getElementById('escola').offsetWidth
        document.getElementById('escola').className='desligado_escola'
        document.getElementById('escola').disabled=true;
    }
}


function alertar(msg,categoria){
    if (limitador_alertas==0){
        limitador_alertas=1
        document.getElementById('alerta_l').innerText=msg
        if(categoria==3){
            document.getElementById('alert').style.border='0.2vw rgb(250, 252, 141) solid'
            document.getElementById('barra_alerta').style.backgroundColor='rgb(250, 252, 141)'
            document.getElementById('alerta_logo').src='imgs/msg_a.png'
            document.getElementById('alerta_l').style.color='rgb(252, 255, 52)'
        }else if(categoria==2){
            document.getElementById('alerta_logo').src='imgs/msg_r.png'
            document.getElementById('alert').style.border='0.2vw rgb(252, 141, 141) solid'
            document.getElementById('barra_alerta').style.backgroundColor='rgb(252, 141, 141)'
            document.getElementById('alerta_l').style.color='rgb(230, 75, 75)'
        }else if(categoria==1){
            document.getElementById('alert').style.border='0.2vw #94fa58 solid'
            document.getElementById('alerta_logo').src='imgs/msg_v.png'
            document.getElementById('barra_alerta').style.backgroundColor='#94fa58'
            document.getElementById('alerta_l').style.color='rgb(76, 231, 123)'

        }
        document.getElementById('alert').className='alertas1'
        setTimeout(()=>{
            document.getElementById('alert').className='alertas0'
            limitador_alertas=0
        },3000)
    }
}


async function Armazena_img(src,obra){
    if(src[0]=='') return
    console.log(src,obra)
    const antes= await fetch('/ver/img')
    const resultado= await antes.json()
    var lista_img=''
    const ver_obras= await fetch('/ver/nome/obras')
    const res1= await ver_obras.json()
    const resposta1 = res1.map(r => r.class)
    for (c=0;c!=resultado.length;c++){
        if(resultado[c]['obra']==obra){
            lista_img=resultado[c]['src'].split(',')
        }
    }
    for (c=0;c!=src.length;c++){
        lista_img.push(src[c])
    }
    console.log(lista_img)
    console.log(src)
    const banco=await fetch('/armarzenar/img',{
            method:'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                src:lista_img.join(','),
                obra:obra
            })

        })
}

async function trocar_funcionario(s){
    if(s==1){
        document.getElementById('painel_int').innerHTML=''
        ct=0
    }else if(s==2){
        if(ct==0){
            document.getElementById('painel_int').innerHTML=''
        }
        const conta= await fetch('/api/funcionarios')
        const res= await conta.json()
        for (c=ct;c!=res.length;c++){
            const ele=document.createElement('section')
            ele.id=`${res[c]['id']}`
            ele.className='usuario'
            ele.innerHTML=`
                <h1 id="nome_f" class="icon_usuario">${res[c]['nome']}</h1>
                <h1 id="senha_f" class="icon_usuario">${res[c]['senha']}</h1>
                <h1 id="class_f" class="icon_usuario">${res[c]['clase']}</h1>
                <h1 id="bt_apagar" onclick="deletar(${res[c]['id']},'contas',1)">x</h1>`
            document.getElementById('painel_int').appendChild(ele)
            ct++
        }
    }
}

function abrir(s) {
    const el = document.getElementById('serviço' + s);
    el.addEventListener('click', function (e) {
        const clicouDiretoNoContainer = e.target === e.currentTarget;
        const clicouNoIcone = e.target.classList.contains('icon_s');

        if (clicouDiretoNoContainer || clicouNoIcone) {
            if (el.className === 'serviço') {
                el.className = 'serviço1';
            } else {
                el.className = 'serviço';
            }
        }
    });
}

async function cadastrar(n=1){
    const user= await fetch('/api/funcionarios')
    const user_list= await user.json()
    var deinir=document.getElementById('select_class').value
    if(n==0){
        if(document.getElementById('funcionario_nome').value.trim()==''){
            alertar('adicione um nome primeiro',2)
            document.getElementById('ceh').checked = false;
            return
        }
        if(key==0){
            key=1
            var obra=document.getElementById('funcionario_nome').value
            var rerpt=obra.substring(0, 4)
            document.getElementById('funcionario_senha').value=rerpt+"123"
        } else if(key==1){
            key=0
            document.getElementById('funcionario_senha').value=''
        }
    return
    }
    if(n==1){
        if(document.getElementById('funcionario_nome').value.trim()=='' || document.getElementById('funcionario_senha').value.trim()==''){
            alertar('Responda todos os campos',2)
            return
        }
        if(!['Adm','Equipe técnica'].includes(deinir)){
            if(document.getElementById('escola').value==''){
                alertar('Selecione a escola',2)
                return
            }else{
                deinir=document.getElementById('escola').value
            }
        }

        for(c=0;c!=user_list.length;c++){
            const an2=document.getElementById('funcionario_nome').value.trim()
            const an1=user_list[c]['nome'].trim()
            if(an1.toUpperCase()==an2.toUpperCase()){
                document.getElementById('funcionario_nome').style.borderColor='rgba(226, 81, 81, 0.68)'
                alertar('Usuario já cadastrado',2)
                
                return
            }
        }
        const lançar=await fetch('/adicionar/conta',{
            method:'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome:document.getElementById('funcionario_nome').value.trim(),
                senha:document.getElementById('funcionario_senha').value.trim(),
                cla:deinir
            })

        })
        if(!lançar.ok){
            alertar('ERRO NO SERV',2)
        }else if (lançar.ok){
            alertar('Dados adicionados',1)
            gerar(1)
            document.getElementById('funcionario_nome').value=''
            document.getElementById('funcionario_senha').value=''
            document.getElementById('ceh').checked
            trocar_funcionario(2)
        }
    }else if(n==2){
        var li=[]
        document.getElementById('escola').innerHTML='<option value="" disabled selected hidden>escola</option>'
        const pau_no_cu = await fetch('/ver/nome/obras')
        const fdp = await pau_no_cu.json()
        for (c=0;c!=fdp.length;c++){
            if(!li.includes(fdp[c]['class'])){
                li.push(fdp[c]['class'])
                console.log(li)
                var el= document.createElement('option')
                el.value=fdp[c]['class']
                el.innerText=fdp[c]['class']
                document.getElementById('escola').appendChild(el)
            }
                
        }
    }
}
async function enviou(s,n_id,imgs){
    const enviados=[document.getElementById(`problema${s}`).innerText,document.getElementById(`funcionario${s}`).value,document.getElementById(`urgencia${s}`).value,document.getElementById('name_escola'+s).innerText]
    await direcionar(3,2,enviados[3],enviados[0],enviados[2],imgs,enviados[1])
    if (enviados[3].trim()=='' || enviados[2].trim()==''){
        alertar('Erro, responda todos os campos do adicional '+s,2)
        return
    }
    document.getElementById('serviço'+s).innerHTML=''
    var img=document.createElement('img')
    img.className='gif'
    img.id='gif'+s
    img.src='imgs/carregamento.gif'
    document.getElementById('serviço'+s).appendChild(img)
    const reposta = await fetch('/adicional', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tarefa: enviados[0],
            equipe: enviados[1],
            cla: enviados[3],
            def: enviados[2]
        })
    })
    if (!reposta.ok) {
        const erro = await reposta.text()
        document.getElementsByClassName('gif'+s).src='imgs/acei.gif'
        return
    }
        const dados = await reposta.json()
    if (dados=='sucesso'){
            Armazena_img(imgs,enviados[3])
            document.getElementById('gif'+s).src='imgs/acei.gif'
            deletar(n_id,'pedidos')
            setTimeout(()=>{document.getElementById('serviço'+s).remove()},3000)
    }
}

async function deletar(s,lc='contas',verificador=0){
    if(verificador==1){
        document.getElementById(s).remove()
    }
    const deletar= await fetch('/deletar/local',{
        method:'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({
            lc:lc,
            id:s
        })
    })
    if(!deletar.ok){
        const erro = await reposta.text()
        console.log(erro)
    }
}

async function gerar(s=1){
    const ver_obra = await fetch ('/ver/obra')
    const obr = await ver_obra.json()
    if(s==1){
        const elementosSegundarios = document.querySelectorAll('#serviços [name="segundario"]'); 
        elementosSegundarios.forEach(elemento => {
            elemento.remove();
        });
        var list=[]
        const rep=await fetch('/api/mostrar')
        const dados=await rep.json()
        const fun= await fetch('/api/funcionarios')
        const funcionarios= await fun.json()
        console.log(funcionarios,c)
        for (let c=controle;c!=dados.length;c++){
            const n_id=dados[c]['id']
            var barra=document.createElement('h1')
            barra.id='barra_meio'
            var bt=document.createElement('h1')
            bt.className='bt_galeria'
            bt.innerText='fotos'
            bt.onclick= () => {
                abrirZoom(imgs, 0)
            }
            const imgs=dados[c]['imagens'].split(',')
            var enviar=document.createElement('h1')
            enviar.id='enviar'
            enviar.innerText='enviar'
            var galeria=document.createElement('section')
            galeria.id='painel_fotos'
            var elemento=document.createElement('section')
            elemento.onclick = () => abrir(c+1);
            elemento.id='serviço'+(c+1)
            enviar.onclick=()=>enviou(c+1,dados[c]['id'],imgs,) 
            elemento.className='serviço'
            elemento.innerHTML=`
                    <h1 id="name_escola${c+1}" class="icon_s">${dados[c]['escola']}</h1>
                    <h1 id="diretorio" class="icon_s">${dados[c]['nome']}</h1>
                    <p id="data" class="icon_s">${dados[c]['data']}</p>
                    <p id="problema${c+1}" class="problema">${dados[c]['pedido']}</p>
                    <select name="" id="urgencia${c+1}" class="input_ur">
                        <option value="" disabled selected hidden>clasificação</option>
                        <option value="emergencia">emergencia</option>
                        <option value="moderado">moderado</option>
                        <option value="leve">leve</option>
                    </select>
                `
            var select= document.createElement('select')
            select.id=`funcionario${c+1}`
            select.className='funcionario'
            select.innerHTML=`<option value="" disabled selected hidden>direcionar</option>`
            for (f=0;f!=funcionarios.length;f++){
                if (funcionarios[f]['clase']=='Equipe técnica'){
                    var option=document.createElement('option')
                    option.value=funcionarios[f]['nome']
                    option.innerText=funcionarios[f]['nome']       
                    select.appendChild(option)
                }
            }
            elemento.appendChild(select)
            elemento.appendChild(bt)
            elemento.appendChild(barra)
            elemento.appendChild(enviar)
            document.getElementById('serviços').appendChild(elemento)
            controle++
        }
    } 
    else if(s==2){
        controle=0
        document.getElementById('serviços').innerHTML=''
        for(let c=0;c!=obr.length;c++){
            if(['emergencia','leve','moderado'].includes(obr[c]['def'])){
                var elemento=document.createElement('section')
                elemento.onclick = () => abir(c+1);
                elemento.id='serviço'+(c+1)
                elemento.className='serviço'
                elemento.setAttribute('name', 'segundario');
                elemento.innerHTML=`
                        <h1 id="name_escola" class="icon_s">${obr[c]['class']}</h1>
                        <p id="data" class="icon_s">${obr[c]['data']}</p>
                        <p id="problema" class="problema">${obr[c]['servicos']}</p>
                        <select name="" id="urgencia" class="input_ur">
                            <option value="" disabled selected hidden>${obr[c]['def']}</option>
                        </select>
                        <select name="" id="urgencia" class="funcionario">
                            <option value="" disabled selected hidden>${obr[c]['equipe']}</option>
                        </select>
                    `
                document.getElementById('serviços').appendChild(elemento)
            }
        }
    }
}

function abir(s){
    var valor = document.getElementById('serviço'+s)
    if (valor.className=='serviço1'){
        valor.className='serviço'
    }else if (valor.className=='serviço'){
        valor.className='serviço1'
    }
}

function abrirZoom(imagens, index) {
    console.log(imagens)
    if(imagens.length==0 || imagens==''){
        alertar('Não a nehuma imagem',3)
        return
    }
    imagensAtuais = imagens;
    indexAtual = index;
    document.getElementById('zoomedImg').src = imagensAtuais[indexAtual];
    document.getElementById('overlay').style.display = 'flex';
}

function fecharZoom() {
    document.getElementById('overlay').style.display = 'none';
}

function proximo(e) {
    e.stopPropagation();
    indexAtual = (indexAtual + 1) % imagensAtuais.length;
    document.getElementById('zoomedImg').src = imagensAtuais[indexAtual];
}

function anterior(e) {
    e.stopPropagation();
    indexAtual = (indexAtual - 1 + imagensAtuais.length) % imagensAtuais.length;
    document.getElementById('zoomedImg').src = imagensAtuais[indexAtual];
}

function trocar(n,s){
    if (s==1){
        gerar()
    }
    if(s==2){
        cadastrar(2)
    }
    if(s==3){
        direcionar(1)
    }
    for (c=0;c!=4;c++){
        document.getElementById('icon'+(c+1)).className='icon0'
    }
    
    document.getElementById('icon'+s).className='icon1'
    document.getElementById(atual).style.zIndex=0
    document.getElementById(n).style.zIndex=1
    atual=n
}

function planilha(s){
    if(s==2){
        montar(1)
    }if(s==3){
        direcionar(1)
    }
    document.getElementById('painels'+s).className='painels1'
}

function fechar(nome){
    document.getElementById(nome).className='painels0'
}
function salvar_obra(){
    const valor=document.getElementById('input_tarefa').value
    document.getElementById('input_tarefa').value=''
    if(valor.trim()==''){
        alertar('adicione uma tarefa',2)
        document.getElementById('input_tarefa').style.borderBottom='0.2vw rgba(255, 0, 0, 0.582) solid'        
    }else{
        document.getElementById('input_tarefa').style.borderBottom='0.2vw #d3d3d3 solid'
        var contadores=inutil
        contadores++
        inutil++
        var texto= document.createElement('h1')
        texto.className='afazer'
        texto.id='afazer'+contadores
        texto.innerText=valor
        texto.onclick= ()=> sumir(contadores)
        document.getElementById('ptr').appendChild(texto)
        tarefas.push(valor)
        
    }
}
function sumir(s){
    document.getElementById('afazer'+s).remove()
    tarefas[s-1]='⟰⥿'
    console.log(tarefas)
}

async function criar(){
    var imagens=[]
    const envio= await fetch('/ver/obra')
    const listas= await envio.json()
    const nome=document.getElementById('input_nome').value.trim()

    for (t=0;t!=form.length;t++){
        const mandar= await fetch('/imagens',{
            method:'POST',
            body:form[t]
        })
        if(!mandar.ok){
            const erro= await mandar.text()
            console.erro('erro no servidor:',erro)
            return
        }
        const urls = await mandar.json()
        imagens.push(urls['url'])
    }
    var tarefas_limpa=[]
    for (c=0;c!=tarefas.length;c++){
        if (tarefas[c]!='⟰⥿'){
            tarefas_limpa.push(tarefas[c])
        }
    }
    tarefas=tarefas_limpa
    for (c=0;c!=listas.length;c++){
        if(nome == listas[c]['class']){
            alertar('Escola já registrada',2)
            return  
        }
    }
    if(nome.length==0 && tarefas.length==0){
        alertar('Responda os campos',2)
        document.getElementById('input_nome').style.borderBottom='0.2vw rgba(255,0,0,0.582) solid'
        document.getElementById('input_tarefa').style.borderBottom='0.2vw rgba(255,0,0,0.582) solid'
        return
    }        
    else if(nome.length==0){
        alertar('Nome não escolhido',2)
        document.getElementById('input_nome').style.borderBottom='0.2vw rgba(255,0,0,0.582) solid'
        document.getElementById('input_tarefa').style.borderBottom='0.2vw #d3d3d3 solid'
        return
    }else if(tarefas.length==0){
        alertar('Tarefa não selecionada',2)
        document.getElementById('input_tarefa').style.borderBottom='0.2vw rgba(255, 0, 0, 0.58) solid'
        document.getElementById('input_nome').style.borderBottom='0.2vw #d3d3d3 solid'
        return
    }
    for (c=0;c!=tarefas.length;c++){
        alertar('Dados adicionado',1)
        document.getElementById('input_tarefa').style.borderBottom='0.2vw #d3d3d3 solid'
        document.getElementById('input_nome').style.borderBottom='0.2vw #d3d3d3 solid'
        const enviar = await fetch('/adicionar/obra',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tarefa: tarefas[c],
                clas:nome,
                img:imagens.join(',')
            })   
        })
        if (!enviar.ok) {
            console.log('erro')
            document.getElementById('alertas').innerText='Erro no servidor'
            document.getElementById('alertas').style.color='rgba(255, 0, 0, 0.58)'
            const erro = await enviar.text()
            return
        }
            const letsad = await enviar.json()
    }
}


async function edit(n,id='none',local='obras'){
    if(n==0){
            if(!confirm('Confirme para excluir essa coluna')){
                return
            }
            var finaly_id=id
            console.log(local)
            console.log(id)
            if(local=='obras'){
                if(quantidade_de_tarefas==1){
                    const delet= await fetch('/deletar/nome',{
                        method:'POST',
                        headers:{
                           'Content-Type': 'application/json' 
                        },
                        body: JSON.stringify({
                            nome: document.getElementById('select').value,
                            lc:'imgs'
                        })
                    })
                }
                document.getElementById('serv'+id).remove()
                quantidade_de_tarefas--

                finaly_id=ids[id-1]
            }
            const deletar= await fetch('/deletar/local',{
                method:'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id:finaly_id,
                    lc:local,
                })
            })
            if (!deletar.ok) {
                console.log('erro')
                const erro = await deletar.text()
                return
            }else{
                if(local=='obras'){
                    if (ids.length!=1){
                        ids[id-1]='null'
                    }else{
                        ids=[]
                    }
                }
            }
    }else if(n==1){
        var n_add=ids.length+1
        var tabela = document.createElement('section')
        tabela.id = 'serv' + n_add
        tabela.className = 'serv'
        tabela.innerHTML = `
            <select id="status${n_add}" class="servi1" onchange="colorir(status${n_add})">
                <option class="opta" value="" disabled selected hidden></option>
                <option class="opta" value="concluido">concluido</option>
                <option class="opta" value="pendente">pendente</option>
                <option class="opta" value="andamento">andamento</option>
            </select>
            <input type="text" id="servicos${n_add}" class="servi1" value="">
            <input type="text" id="equipe${n_add}" class="servi1" value="">
            <input type="text" id="dt${n_add}" disabled class="servi1" value="">
            <select id="pago${n_add}" class="servi1" onchange="colorir(pago${n_add})">
                <option value="" disabled selected hidden></option>
                <option class="opta" value="sim">sim</option>
                <option class="opta" value="não">não</option>
            </select>
            <input type="text" id="obs${n_add}" class="servi1" value="">
            <h1 class="span_apagar" onclick="edit(0,${n_add})">x</h1>
        `
        document.getElementById('servs').appendChild(tabela)
        ids.push('add')
        console.log(ids)
        console.log(n_add)
    }
}

function colorir(nome){
    const valor1 = nome
    const repostas_v = valor1?.options[valor1.selectedIndex]?.value;
    console.log(repostas_v)
    if (repostas_v=='concluido'){
        nome.style='color:rgb(24, 255, 16)'
    } else if (repostas_v=='pendente'){
        nome.style='color: rgb(255, 251, 0)'
    } else if (repostas_v=='andamento'){
        nome.style='color: rgb(30, 58, 216)'
    } else if (repostas_v=='não'){
        nome.style.color='rgba(255, 0, 0, 0.9)'
    } else if (repostas_v=='sim'){
        nome.style.color='rgba(0, 255, 0, 0.81)'
    }
}


async function montar(parte){
    const valor= await fetch('/ver/obra')
    const obrras= await valor.json()
    let cota=0
    if (parte==1){
        const list=[]
        document.getElementById('painels2').innerHTML = `
        <h1 id="sair" onclick="fechar('painels2')">X</h1>
        <h1 id="alertas2"></h1>
            <section id="servs">
                <section id="categorias">
                    <input type="text" id="status" disabled class="servi2" value="status">
                    <input type="text" id="tarefa" disabled class="servi2" value="tarefa">
                    <input type="text" id="equipe" disabled class="servi2" value="equipe">
                    <input type="text" id="dt" disabled class="servi2" value="data">
                    <input type="text" id="pago" disabled class="servi2" value="pago">
                    <input type="text" id="obs" disabled class="servi2" value="obs">
                </section>
            </section>
        <h1 id="bt_alterar" onclick="montar(3)">salvar</h1>`;
        var elemento=document.createElement('select')
        elemento.id='select'
        elemento.innerHTML=`<option value="" disabled selected hidden>selecione</option>`
        elemento.onchange= ()=>{
            montar(2)
        }
        for (c=0;c!=obrras.length;c++){
            if(!list.includes(obrras[c]['class'])){
                const option= document.createElement('option')
                option.value=obrras[c]['class']
                option.innerText=obrras[c]['class']
                elemento.appendChild(option)
                list.push(obrras[c]['class'])
            }
        }
        document.getElementById('painels2').appendChild(elemento)
        const section = document.getElementById('servs');
        section.addEventListener('change', (event) => {
            const target = event.target;
            if (target.tagName === 'SELECT' || target.tagName === 'INPUT') {
                document.getElementById('bt_alterar').style.background='rgb(84, 226, 143)'
            }
        });
    
    }if (parte==2){
        if(!document.getElementsByClassName('acao')==null){
            document.getElementsByClassName('acao').remove()
            document.getElementById('ver_imgs').remove()
        }
        ids=[]
        var imgsa=[]
        const imad= await fetch('/ver/img')
        const re_img= await imad.json()
        for(t=0;t!=re_img.length;t++){
            if(re_img[t]['obra']==document.getElementById('select').value){
                imgsa=re_img[t]['src'].split(',')
            }
        }
        console.log(imgsa)
        var bt_verd=document.createElement('h1')
        bt_verd.id='adicionar'
        bt_verd.className="acao"
        bt_verd.onclick= ()=>edit(1)
        bt_verd.innerText='+'
        var ver_foto=document.createElement('h1')
        if(imgsa.length==[]){
            console.log('aasd')
            ver_foto.className='desligado'
        }else{ver_foto.className='ligado'}
        ver_foto.id='ver_imgs'
        ver_foto.onclick=()=>{
            abrirZoom(imgsa,0)
        }
        ver_foto.innerText='Fotos'
        
        document.getElementById('painels2').appendChild(ver_foto)
        document.getElementById('painels2').appendChild(bt_verd)
        document.getElementById('alertas2').innerText=''
        document.getElementById('alertas2').style.color='rgba(84, 226, 143, 0)'
        document.getElementById('bt_alterar').style.background='#c7e0cc'
        document.getElementById('servs').innerHTML=`
                <section id="categorias" >
                    <input type="text" id="status" disabled class="servi2" value="status">
                    <input type="text" id="tarefa" disabled class="servi2" value="tarefa">
                    <input type="text" id="equipe" disabled class="servi2" value="equipe">
                    <input type="text" id="dt" disabled class="servi2" value="data">
                    <input type="text" id="pago" disabled class="servi2" value="pago">
                    <input type="text" id="obs" disabled class="servi2" value="obs">
                </section>`
        for(c=0;c!=obrras.length;c++){
            if(obrras[c]['class']==document.getElementById("select").value){
                quantidade_de_tarefas++
                cota++
                var tabela=document.createElement('section')
                tabela.id='serv'+cota
                tabela.className='serv'
                nome_escola=obrras[c]['class']
                tabela.innerHTML=`
                    <select id="status${cota}" class="servi1" onchange="colorir(status${cota})") >
                        <option class="opta" value="" disabled selected hidden>${obrras[c]['status']}</option>
                        <option class="opta" value="concluido">concluido</option>
                        <option class="opta" value="pendente">pendente</option>
                        <option class="opta" value="andamento">andamento</option>
                    </select>
                    <input type="text" id="servicos${cota}" class="servi1" value="${obrras[c]['servicos']}">
                    <input type="text" id="equipe${cota}" class="servi1" value="${obrras[c]['equipe']}">
                    <input type="text" id="dt${cota}" disabled class="servi1" value="${obrras[c]['data']}">
                    <select id="pago${cota}" class="servi1" onchange="colorir(pago${cota})">
                        <option value="" disabled selected hidden>${obrras[c]['pago']}</option>
                        <option class="opta" value="sim">sim</option>
                        <option class="opta" value="não">não</option>
                    <input type="text" id="obs${cota}" class="servi1" value="${obrras[c]['obs']}">
                    <h1 class="span_apagar" onclick="edit(0,${cota})">x</h1>
                `
                document.getElementById('servs').appendChild(tabela)
                ids.push(obrras[c]['id'])
            }
        }
    }if (parte == 3) {
        for (let c = 0; c < ids.length; c++) {
            if(ids[c]!='null'){
                const body = {
                    id: ids[c],
                    cl: nome_escola
                };
        

                // Status
                const elemento1 = document.getElementById('status' + (c + 1));
                const statusVal = elemento1?.options[elemento1.selectedIndex]?.value;
                if (statusVal) body.status = statusVal;
        
                // Servicos
                const servicosVal = document.getElementById('servicos' + (c + 1))?.value;
                if (servicosVal) body.servicos = servicosVal.trim();
        
                // Equipe
                const equipeVal = document.getElementById('equipe' + (c + 1))?.value;
                if (equipeVal) body.equipe = equipeVal.trim();
        
                // Pago
                const pago1 = document.getElementById('pago' + (c + 1));
                const pagoVal = pago1?.options?.[pago1.selectedIndex]?.value;
                if (pagoVal) body.pago = pagoVal;
        
                // Obs
                const obsVal = document.getElementById('obs' + (c + 1))?.value;
                if (obsVal) body.obs = obsVal.trim();
            
                const enviar = await fetch('/alterar/obra', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });
        
                if (!enviar.ok) {
                    const erro = await enviar.text();
                    console.error('Erro ao enviar:', erro);
                    document.getElementById('alertas2').style.color='rgba(255, 41, 13, 0.8)'
                    document.getElementById('alertas2').innerText="Erro no servidor"
                    return;
                }
                else{
                    document.getElementById('alertas2').style.color='rgb(84, 226, 143)'
                    document.getElementById('alertas2').innerText="Dados modificados"
                }
                const modificar= await fetch('/atualizar/null',{
                    method:'POST'
                })
            }
        }
    }
}

async function exibir(event) {
    if(form.length==3){
        alertar('limite de 3 imagens atingido',2
        )
        document.getElementById('imagem_file').src='imgs/Tutto (5).png'
        return
    }
            var sal=0
            document.getElementById('aviso').innerText=''
            const input = document.getElementById('arquivos');
            const ar=input.files[0]
            if (input.files && input.files[0]) {
                const file = event.target.files[0]
                const formdata=new FormData()
                formdata.append('imagem', file)
                form.push(formdata)
                sal=formdata
            }
            const t=form.length
            top1+=4
            var ele=document.createElement('label')
            ele.className='img_text'
            ele.style.top=`${top1}vh`
            ele.id='img'+t
            ele.onclick = () => {
                apagar_img(t,sal);
            };
            ele.for='arquivo'
            ele.innerText=`${ar.name}`
            document.getElementById('painels1').appendChild(ele)

}

function apagar_img(s,f){
    top1-=4
    var p1=form.indexOf(f)
    form.splice(p1,1)
    document.getElementById('img'+s).remove()
    
}

async function direcionar(s,verificador=1,escola='',tare='',defi2='obra',imgs=[],fuc=''){
    var defi=''
    tarefas_apagadas=[]
    var list=[]
    var resp= await fetch('/ver/obra')
    var resposta_obra=await resp.json()
    var resp1= await fetch('/api/funcionarios')
    var imagens=[]
    const resposta_funcionarios=await resp1.json()
    if(s==1){
        list2=[]
        document.getElementById('painels3').innerHTML=`
            <h1 id="sair" onclick="fechar('painels3')">X</h1>
            <section id="equip1e">
            </section>
            <select name="" id="meninos">
                <option value="" disabled selected hidden>funcionario</option>
            </select>
            <h1 id="bt_montr" onclick="direcionar(2)">Direcionar</h1>
            <select name="" id="obras" onchange="direcionar(4)">
                <option value="" disabled selected hidden>Obras</option>
            </select>
            <textarea id="obbs" name="mensagem" rows="4" cols="50" placeholder="Digite uma observação"></textarea>
            <h1 id="bt_enviar_d" onclick="direcionar(3)">Enviar</h1>
             <section id="analise_taf">
            </section>`
        for(let c=0;c!=resposta_obra.length;c++){
            if(!list.includes(resposta_obra[c]['class'])){
                    list.push(resposta_obra[c]['class'])
                    var elemento=document.createElement('option')
                    elemento.value=resposta_obra[c]['class']
                    elemento.innerText=resposta_obra[c]['class']
                    document.getElementById('obras').appendChild(elemento)
            }
        }
        for(let c=0;c!= resposta_funcionarios.length;c++){
            if(resposta_funcionarios[c]['clase']=='Equipe técnica'){
                var elemento=document.createElement('option')
                elemento.value=resposta_funcionarios[c]['nome']
                elemento.innerText=resposta_funcionarios[c]['nome']
                document.getElementById('meninos').appendChild(elemento)        
            }
        }

    }else if(s==2){
        func=[]
        if(!list2.includes(document.getElementById('meninos').value)){
            document.getElementById('meninos').style.color='#222525'
            var nase=document.getElementById('meninos').value
            list2.push(document.getElementById('meninos').value)
            func.push(document.getElementById('meninos').value)
            var elet=document.createElement('h1')
            elet.innerText=document.getElementById('meninos').value
            elet.id=document.getElementById('meninos').value
            elet.className='integrante'
            elet.onclick=()=>{
                apagar_fu(nase)
            }
            document.getElementById('equip1e').appendChild(elet)
        }else{
            alertar('funcionario já escolhido',2)

        }
    }else if(s==3){
        var ob=''
        const agora = new Date();
        const dia = String(agora.getDate()).padStart(2, '0');
        const mes = String(agora.getMonth() + 1).padStart(2, '0'); // meses vão de 0 a 11
        const ano = agora.getFullYear();
        const dataFormatada = `${dia}/${mes}/${ano}`;
        const fodase= await fetch('/ver/img')
        const rec= await fodase.json()
        var taf=[]
        var idss=[]
        var valor_obra=document.getElementById('obras').value.trim()
        if(verificador==1){
            var p=document.getElementById('obbs').value.trim()
            ob=p
            defi='obra'
            taf=[]
            for (w=0;w!=lista_adicionados.length;w++){
                if(document.getElementById('ceh_taf'+(w+1)).checked){
                    tarefas_apagadas.push(lista_de_add[w])
                    console.log(tarefas_apagadas)
                }
            }
    
            if(valor_obra==''){
                document.getElementById('obras').style.color='red'
                alertar('Selecione a obra',2)
                return
            }if(list2.length==0){
                document.getElementById('obras').style.color='#222525'
                document.getElementById('meninos').style.color='red'
                alertar('caixa de envio vazia',2)
                return
            }
            document.getElementById('meninos').style.color='#222525'
            for(x=0;x!=resposta_obra.length;x++){
                console.log(resposta_obra[x]['id'])
                console.log(lista_de_add)
                if(resposta_obra[x]['class']==valor_obra && resposta_obra[x]['status']!='concluido'&& resposta_obra[x]['def']=='obras' && !tarefas_apagadas.includes(resposta_obra[x]['id'])){  
                        taf.push(resposta_obra[x]['servicos'])
                        idss.push(resposta_obra[x]['id'])
                }
            }
            for (x=0;x!=rec.length;x++){
                if(rec[x]['obra']==valor_obra){
                    imagens=rec[x]['src'].split(',')       
                }
            }
        }else if (verificador==2){
            // idss=[ < IR NA FUNÇÃO ENVIAR E ADICIONAR A CATEGORIA ID E ENVIAR O ID PRA CÁ > ]
            valor_obra=escola
            taf=tare
            ob='< não adicionado ainda >'
            imagens=imgs
            func=[fuc]
            defi=defi2
        }
    
        if(taf.length==0){
            alertar('Nenhuma tarefa enviada',2)
            return
        }
    
        var array={escola:valor_obra,tarefas:taf,obs:ob,imgs:imagens,def:defi,data:dataFormatada,id:idss}
        var array_txt=JSON.stringify(array)
        for (c=0;c!=func.length;c++){
            var usa=func[c]
            for(x=0;x!=resposta_funcionarios.length;x++){
                if(resposta_funcionarios[x]['nome']==usa){
                    const envi= await fetch('/contas/acrecentar',{
                        method:'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body:JSON.stringify({
                            nome:usa,
                            tarefa:array_txt,
                        })
                    })  
                    if (!envi.ok) {
                        const erro = await envi.text()
                        return
                    }
                    if(envi.ok){
                        console.log(array)
                        alertar('seviço enviado',1)
                    }
                }
            }
        }
    
    }else if(s==4){
        document.getElementById('analise_taf').innerHTML=''
        lista_adicionados=[]
        lista_de_add=[]
        tarefas_apagadas=[]
        var ss=0 
        var escola = document.getElementById('obras').value
        for(y=0;y!=resposta_obra.length;y++){
            if(resposta_obra[y]['class']==escola && resposta_obra[y]['def']=='obras' && resposta_obra[y]['status']!='concluido'){
                ss++
                var ele=document.createElement('section')
                ele.className='tafs'
                ele.innerHTML=`
                    <input type="checkbox" class="ceh_tafs" id="ceh_taf${ss}">
                    <h1 id="name_taf${ss}" class="nome_tafs">${resposta_obra[y]['servicos']}</h1>`
                document.getElementById('analise_taf').appendChild(ele)
                lista_adicionados.push(resposta_obra[y]['servicos'])
                console.log(lista_adicionados)
                lista_de_add.push(resposta_obra[y]['id'])
            }
        }
    }
    
    function apagar_fu(s){
        document.getElementById(s).remove()
        let index= list2.indexOf(s)
        list2.splice(index,1)
    }
    
    setInterval(() => {
        gerar(0,'sim')
    }, 1000);
}    
subscribe()
