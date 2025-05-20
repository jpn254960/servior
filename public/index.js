var limitador_alertas=0
function alertar(msg,categoria){
  if (limitador_alertas==0){
      limitador_alertas=1
      console.log(msg)
      document.getElementById('alerta_l').innerText=msg
      if(categoria==3){
          document.getElementById('alert').style.border='0.2vw rgb(250, 252, 141) solid'
          document.getElementById('barra_alerta').style.backgroundColor='rgb(250, 252, 141)'
          document.getElementById('alerta_logo').src='imgs/msg_a.png'
          document.getElementById('alerta_l').style.color='rgb(253, 255, 134)'
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



async function entrar(){
  const user= await fetch('/api/funcionarios')
  const usuarios = await user.json()
  const senha=document.getElementById('senha').value
  const nome= document.getElementById('nome').value
  for(c=0;c!=usuarios.length;c++){
    if(usuarios[c]['nome'].toUpperCase()==nome.toUpperCase() && usuarios[c]['senha']==senha){
      if(usuarios[c]['clase']=='Adm'){
        open('adm.html','_self')
      }else if(usuarios[c]['clase']=='Equipe técnica'){
        localStorage.setItem('nome',usuarios[c]['nome'])
        open('workOn.html','_self')
      }else{
        localStorage.setItem('escola',usuarios[c]['clase'])
        open('workid.html','_self')
      }
      return
    }
  }
  alertar('Verifique seus dados e tente novamente',2)
}