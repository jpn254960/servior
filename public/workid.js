var perguntas=['agora nos diga o<span style="color:rgb(96, 96, 250)"> seu nome </span>','qual seria o assunto?','agora tire uma bela <span style="color: rgb(96, 96, 250);">foto do problema </span> e clique logo abaixo par encaminhar']
var perguntas2=['seu nome','qual foi o problema','foto']
var Type=['text','text','file']
var dados=[localStorage.getItem('escola')]
var imagem=[]
var form=[]
var contator=0
var s=-1

document.getElementById('input').addEventListener('keydown',function(s){
    if (s.key==='Enter'){
        passar()
    }
})

function voltar(){
    if (s>0){
        s-=2
        dados.splice(-1,1)
        document.getElementById('file').className='apagado'
        document.getElementById('input').style.display='block'
        passar(2)
        console.log(dados)

    }
}

function tirar(s,img){
    console.log(s)
    console.log(form)
    contator--
    var p=form.indexOf(s)
    form.splice(p,1)
    console.log(form)
    document.getElementById('previa'+img).remove()

}

// precisa arrumar o sistema de contagem

async function exibir(event) {
    if (contator==2){
        alert('so é permitido envia dois arquivos')
        return
    }else{
        contator++;
        const input = document.getElementById('fileInput');
        const fileName = document.getElementById('fileName');
        if (input.files && input.files[0]) {
            const file = event.target.files[0]
            const formdata=new FormData()
            formdata.append('imagem', file)
            form.push(formdata)

            const fil = input.files[0];
            const imgURL = URL.createObjectURL(fil);

            const elemento = document.createElement('img');
            elemento.src = imgURL;
            elemento.alt = 'img';
            elemento.className = 'previa';
            elemento.id = `previa${imgURL}`;
            elemento.onclick = () => tirar(formdata,imgURL);
            fileName.appendChild(elemento);
        }
    }
}

function passar(entrada=1){
    s++
    if(s<3){
        document.getElementById('contador').innerText=s+1+'/3'
    }
    if(s==3){
        console.log('enviado')
        enviar()
    }else{
        var input=document.getElementById('input').value.trim()
        if (s==perguntas.length){
            s=0
        }     
        if (input=='' && s!=0 && entrada==1){
            s--
            document.getElementById('input').style.border='0.1vw solid red'
            document.getElementById('aviso').innerText='preencha o campo'

        }else{
            if (s!=0 && entrada==1){
                dados.push(input)
            }
            document.getElementById('aviso').innerText=''
            document.getElementById('input').style.border='0.1vw solid #222525'
            document.getElementById('inicio').style.display='none'
            document.getElementById('questionario').style.display='block'
            document.getElementById('questionario').className='ativo'
            document.getElementById('tq1').innerHTML=perguntas[s]
            document.getElementById('input').placeholder=perguntas2[s]
            document.getElementById('input').type=Type[s]
            document.getElementById('input').value=''
            setTimeout(()=>{
            document.getElementById('questionario').className=''
            },2000)
        }
        if(s==2){
            document.getElementById('file').className='file-upload'
            document.getElementById('input').style.display='none'
        }     
    }  
}

async function enviar(){
    if(form.length==0){
        s--
        alert('Encaminhe uma imagem')
        return
    }

    for (c=0;c!=form.length;c++){
        const reposta= await fetch('/imagens', {
            method: 'POST',
            body: form[c],
        })
        if (!reposta.ok) {
        const erro = await reposta.text()
        console.error('Erro do servidor:', erro)
        return
        }
        const dado = await reposta.json()
        imagem.push(dado['url'])
    }
    document.getElementById('questionario').innerHTML='<img id="icons_finais" alt="gif" src="imgs/carregamento.gif">'
    console.log(dados)
    const salvar = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            escola: dados[0],
            nome: dados[1],
            pedido: dados[2],
            links:imagem.join(",")
        }),
    })
    if(salvar.ok){
        fetch('/send',{
            method:'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({
                nome:dados[1],
                escola:dados[0]
            })
        })
    }
    setTimeout(()=>{
        document.getElementById('questionario').innerHTML='<img id="icons_finais" alt="gif" src="imgs/acei.gif">'
    },3000)
    setTimeout(()=>{
        location.reload();
    },5000)
}
