// server/server.js
const { createClient } = require('@supabase/supabase-js')
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require("os");
const app = express();
const port = 3000;
const cors = require("cors"); 
const multer = require('multer');
const { error } = require('console');
const { runInNewContext } = require('vm');
const { openAsBlob } = require('fs');
const webpush = require('web-push');
const bodyParser = require('body-parser');

const upload = multer() // Armazena em memória


app.use(express.json()); // Permite requisições com JSON
app.use(cors());
app.use(bodyParser.json());
// Configuração do banco de dados SQLite3
const db = new sqlite3.Database('./database.db');
// Middleware para processar o corpo da requisição em formato JSON
app.use(express.json());  // Necessário para lidar com JSON no corpo da requisição

const publicKey = 'BMURfov6YsKH8aD9cdyqVG8TJEdlnu7Vgq_9buQnLm-E5D-akX7m713T7UCR7plus2RSOmi1XEtSvzLgX91HE8Y';
const privateKey = 'S0PFzIBQkefk10tI3rNwXnl_7H1IjB7ZNdp3AnKun8M';



webpush.setVapidDetails(
  'mailto:joaopepeudro@gmail.com',
  publicKey,
  privateKey
);
let savedSubscription = null;

app.post('/subscribe', (req, res) => {
  savedSubscription = req.body;
  console.log('Subscrição salva!');
  res.sendStatus(201);
});



app.get('/', (req, res) => {
  const memory = process.memoryUsage();
  const cpu = process.cpuUsage();
  res.json({
    memoryMB: memory.rss / 1024 / 1024,
    cpu: cpu
  });
});


app.post('/send', (req, res) => {
  const {nome,escola} = req.body
  console.log(req.body)
  console.log('acessou')
  if (!savedSubscription) return res.status(400).send('Nenhuma inscrição disponível.');

  const payload = JSON.stringify({
    title: `Notificação de Diretora ${nome}`,
    body: `A escola ${escola} solicitou um adicional`
  });

  webpush.sendNotification(savedSubscription, payload)
    .then(() => res.send('Notificação enviada com sucesso!'))
    .catch(err => {
      console.error('Erro ao enviar notificação:', err);
      res.sendStatus(500);
    });
});


// Serve arquivos estáticos (HTML, JS, CSS)
app.use(express.static(path.join(__dirname, '../public')));
const supabase = createClient(
  'https://ytoggergllhnxtcybehq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0b2dnZXJnbGxobnh0Y3liZWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NjQ0NTgsImV4cCI6MjA1OTQ0MDQ1OH0.wy2prmGFWnW_BRC8Kqtrn1sBMWE1B_3v96S74FUT3OM'
)

app.post('/adicionar/conta',(req,res) => {
  const {nome,senha,cla} = req.body;
  console.log(req.body)
  db.run(
    `INSERT INTO contas (nome,senha,clase,trabalhos)  VALUES (?,?,?,?)`,
    [nome,senha,cla,' '],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json('sucesso');
    }
  )
})




app.post('/imagens', upload.single('imagem'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('Nenhum arquivo enviado.')
    }

    const nome = `uploads/${Date.now()}_${req.file.originalname}`

    const { data, error } = await supabase.storage
      .from('imagens')
      .upload(nome, req.file.buffer, {
        contentType: req.file.mimetype,
      })

    if (error) {
      console.error('Erro no Supabase:', error)
      throw error
    }

    const url = supabase.storage.from('imagens').getPublicUrl(data.path).data.publicUrl
    res.json({ url })
  } catch (err) {
    console.error('Erro no upload:', err)
    res.status(500).send('Erro no upload')
  }
})

app.post('/armarzenar/img', (req,res)=>{
  const {obra,src}=req.body
  console.log(req.body)
  db.run(
    `UPDATE imgs SET src=? WHERE obra = ?`,[src,obra],
    function (err) {
      if (err) {
        console.error('Erro ao atualizar obra:', err);
        res.status(500).send('Erro no banco de dados');
      } else {
        res.send({ success: true, rowsAffected: this.changes });
      }
    }
  )
})

app.get('/ver/img', (req, res) => {
  db.all('SELECT * FROM imgs', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/up/trabalhos', (req,res)=>{
  const {nome,tr}=req.body
  console.log(req.body)
  db.run(
    `UPDATE contas SET trabalhos=? WHERE nome = ?`,[tr,nome],
    function (err) {
      if (err) {
        console.error('Erro ao atualizar obra:', err);
        res.status(500).send('Erro no banco de dados');
      } else {
        res.send({ success: true, rowsAffected: this.changes });
      }
    }
  )
})


// Rota para obter dados dos usuários
app.get('/api/funcionarios', (req, res) => {
  db.all('SELECT * FROM contas', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/contas/acrecentar', (req, res) => {
  const { tarefa, nome} = req.body;

  // Converte para string (se for array)
  const tarefaStr = Array.isArray(tarefa) ? tarefa.join(', ') : String(tarefa);

  const sql = `UPDATE contas SET trabalhos = COALESCE(trabalhos,'') || ? WHERE nome = ?`;

  db.run(sql, [" "+tarefaStr, nome], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ status: 'sucesso' });
  });
});


app.post('/adicional',(req,res) => {
  const {tarefa,equipe,cla,def} = req.body;
  console.log(req.body)
  db.run(
    `INSERT INTO obras (servicos,equipe,class,data,status,pago,obs,def)  VALUES (?,?,?,strftime('%d-%m-%Y %H:%M', 'now', 'localtime'),?,?,?,?)`,
    [tarefa, equipe, cla, 'pendente', 'não','',def],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json('sucesso');
    }
  )
})


app.get('/api/mostrar', (req, res) => {
  db.all('SELECT * FROM pedidos', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/ver/trabalhos', (req, res) => {
  const { nome } = req.body;

  db.all(
    `SELECT trabalhos FROM contas WHERE nome = ?`, [nome],
    (err, rows) => {
      if (err) return res.status(500).json({ err: err.message });

      res.json({ trabalhos: rows });
    }
  );
});

app.post('/atualizar/null',(req,res) =>{
  db.run(`UPDATE obras SET def = 'obras' WHERE def IS NULL`, function (err2) {
      if (err2) return res.status(500).json({ err: err2.message });
      res.json('enviado');
  })
})


app.post('/alterar/obra', (req, res) => {
  const { id, status, servicos, equipe, pago, obs , cl} = req.body;
  if(id=='add'){
    const serv = servicos ?? ' ';
    const eqp = equipe ?? ' ';
    const sts = status ?? ' ';
    const pg = pago ?? ' ';
    const ob = obs == ' ';
    const classe = cl ?? ' ';
    console.log(req.body)
    db.run(
      `INSERT INTO obras (servicos, equipe, status, class, data, pago, obs)
       VALUES (?, ?, ?, ?, strftime('%d-%m-%Y %H:%M', 'now', 'localtime'), ?,?)`,
      [serv, eqp , sts, classe, pg,ob],
      function (err) {
        if (err) return res.status(500).json({ err: err.message })
        res.json('enviado')
    })

  }else{
    const campos = [];
    const valores = [];

    if (servicos !== undefined) {
      campos.push('servicos = ?');
      valores.push(servicos);
    }
    if (equipe !== undefined) {
      campos.push('equipe = ?');
      valores.push(equipe);
    }
    if (status !== undefined) {
      campos.push('status = ?');
      valores.push(status);
    }
    if (pago !== undefined) {
      campos.push('pago = ?');
      valores.push(pago);
    }
    if (obs !== undefined) {
      campos.push('obs = ?');
      valores.push(obs);
    }

    // Se nenhum campo foi enviado, não há o que atualizar
    if (campos.length === 0) {
      return res.status(400).send('Nenhum campo para atualizar');
    }
    // Adiciona o id no final
    valores.push(id);
    const sql = `UPDATE obras SET ${campos.join(', ')} WHERE id = ?`;

    db.run(sql, valores, function (err) {
      if (err) {
        console.error('Erro ao atualizar obra:', err);
        res.status(500).send('Erro no banco de dados');
      } else {
        res.send({ success: true, rowsAffected: this.changes });
      }
    });
  }

});

app.get('/ver/nome/obras', (req,res) => {
  db.all('SELECT class FROM obras', [], (err,rows)=>{
    if(err){
      return res.status(500).json({error: err.message})
    }
    res.json(rows)
  })
})

app.get('/ver/obra', (req,res) => {
  db.all('SELECT * FROM obras', [], (err,rows)=>{
    if(err){
      return res.status(500).json({error: err.message})
    }
    res.json(rows)
  })
})

app.post('/api/pedidos',(req, res) => {
  const { escola, nome, pedido, links} = req.body;

  db.run(
    `INSERT INTO pedidos (escola, nome, pedido, data, imagens, status) VALUES (?, ?, ?,strftime('%d-%m-%Y %H:%M', 'now', 'localtime'),?,?)`,
    [escola, nome, pedido, links, 'pendente'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.post('/adicionar/obra', (req, res) => {
  console.log(req.body);
  const { tarefa, clas, img } = req.body;
  db.run(
    `INSERT INTO obras (servicos, equipe, status, class, data, pago, obs, def)
     VALUES (?, ?, ?, ?, strftime('%d-%m-%Y %H:%M', 'now', 'localtime'), ?, ?, ?)`,
    [tarefa, '', 'pendente', clas, 'não', '', 'obras'],
    function (err) {
      if (err) return res.status(500).json({ err: err.message });
      }
      
    )
    db.run(
      `INSERT INTO imgs (obra, src) VALUES (?, ?)`,
      [clas, img],
      function (err3) {
        if (err3) return res.status(500).json({ err: err3.message });
        res.json({ msg: 'adicionadas com sucesso' });
      }
    )
  }
  )

app.post('/deletar/local', (req,res) => {
  console.log(req.body)
  const {id,lc}= req.body
  const codigo=`DELETE FROM ${lc} WHERE id = ?`
  db.run(
    codigo,
    [id],
    function(err){
      console.log('aceesa')
      if(err) {return res.status(500).json({err:err.message})}
      else{ res.send({ success: true, rowsAffected: this.changes });}
    }
  )
})

app.post('/deletar/nome', (req,res) => {
  console.log(req.body)
  const {nome,lc}= req.body
  const codigo=`DELETE FROM ${lc} WHERE obra = ?`
  db.run(
    codigo,
    [nome],
    function(err){
      console.log('aceesa')
      if(err) {return res.status(500).json({err:err.message})}
      else{ res.send({ success: true, rowsAffected: this.changes });}
    }
  )
})

app.post('/finalizar',(req,res) => {
  console.log(req.body)
  const{ nome,idr,estatuss}=req.body
  for (w=0;w!=idr.length;w++){
    var id=idr[w]
    var statu=estatuss[w]
    console.log(id," ",statu," ",nome)
    db.run(
        `UPDATE obras SET equipe= COALESCE(equipe,'') || ? WHERE id = ?`,[' '+nome,id],
        function(err){
          if(err){
            return res.status(500).json({err:err.message})
          }
        }
      )
      db.run(
        `UPDATE obras SET status = ? WHERE id=?`,[statu,id],
        function(err){
          if(err){
            return res.status(500).json({err:err.message})
          }
        }
      )
  }
      })

// Inicia o servidor

app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://0.0.0.0:${port}`);
});
