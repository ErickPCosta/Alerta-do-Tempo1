document.querySelector('#search').addEventListener('submit', async (event) => {
  event.preventDefault();

  const cityName = document.querySelector('#city_name').value;

  if (!cityName) {
    document.querySelector("#weather").classList.remove('show');
    showAlert('Você precisa digitar uma cidade...');
    return;
  }

  const apiKey = '8a60b2de14f7a17c7a11706b2cfcd87c';
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(cityName)}&appid=${apiKey}&units=metric&lang=pt_br`;

  const results = await fetch(apiUrl);
  const json = await results.json();

  if (json.cod === 200) {
    showInfo({
      city: json.name,
      country: json.sys.country,
      temp: json.main.temp,
      tempMax: json.main.temp_max,
      tempMin: json.main.temp_min,
      description: json.weather[0].description,
      tempIcon: json.weather[0].icon,
      windSpeed: json.wind.speed,
      humidity: json.main.humidity,
    });
    buscarAlertas(cityName);
    buscarNoticias(cityName); // <-- Agora isso vai funcionar!
  } else {
    document.querySelector("#weather").classList.remove('show');
    showAlert(`
      Não foi possível localizar...
      <img src="src/images/404.svg"/>
    `);
  }
});

function showInfo(json) {
  showAlert('');

  document.querySelector("#weather").classList.add('show');

  document.querySelector('#title').innerHTML = `${json.city}, ${json.country}`;
  document.querySelector('#temp_value').innerHTML = `${json.temp.toFixed(1).toString().replace('.', ',')} <sup>C°</sup>`;
  document.querySelector('#temp_description').innerHTML = `${json.description}`;
  document.querySelector('#temp_img').setAttribute('src', `https://openweathermap.org/img/wn/${json.tempIcon}@2x.png`);
  document.querySelector('#temp_max').innerHTML = `${json.tempMax.toFixed(1).toString().replace('.', ',')} <sup>C°</sup>`;
  document.querySelector('#temp_min').innerHTML = `${json.tempMin.toFixed(1).toString().replace('.', ',')} <sup>C°</sup>`;
  document.querySelector('#humidity').innerHTML = `${json.humidity}%`;
  document.querySelector('#wind').innerHTML = `${json.windSpeed.toFixed(1)}km/h`;
}

function showAlert(msg) {
  document.querySelector('#alert').innerHTML = msg;
}

const backendURL = 'https://alerta-do-tempo1-production.up.railway.app';

async function buscarAlertas(cidade) {
  const resultado = document.getElementById('alertas-result');
  resultado.innerHTML = '🔄 Buscando alertas...';

  try {
    const resposta = await fetch(`${backendURL}/api/alertas?cidade=${encodeURIComponent(cidade)}`);
    const dados = await resposta.json();

    if (!dados.alertas || dados.alertas.length === 0) {
      resultado.innerHTML = `<p>✅ Sem alertas atuais para <strong>${cidade}</strong>.</p>`;
      return;
    }

    resultado.innerHTML = `<p>🚨 ${dados.alertas.length} alerta(s) para <strong>${cidade}</strong>:</p>`;

    dados.alertas.forEach(alerta => {
      const div = document.createElement('div');
      div.classList.add('alerta');
      div.innerHTML = `
        <h3>${alerta.event}</h3>
        <p><strong>Início:</strong> ${new Date(alerta.start * 1000).toLocaleString()}</p>
        <p><strong>Fim:</strong> ${new Date(alerta.end * 1000).toLocaleString()}</p>
        <p>${alerta.description}</p>
      `;
      resultado.appendChild(div);
    });
  } catch (erro) {
    resultado.innerHTML = `<p style="color:red;">❌ Erro ao buscar alertas: ${erro.message}</p>`;
  }
}

// ✅ Agora sim: buscarNoticias fora de tudo
async function buscarNoticias(cidade) {
  const noticiasDiv = document.getElementById('noticias-result');
  noticiasDiv.innerHTML = '📰 Buscando notícias...';

  try {
    const resposta = await fetch(`https://sua-api-alertas.onrender.com/api/noticias?cidade=${encodeURIComponent(cidade)}`);
    const dados = await resposta.json();

    if (!dados.noticias || dados.noticias.length === 0) {
      noticiasDiv.innerHTML = `<p>✅ Nenhuma notícia recente de alagamento encontrada para <strong>${cidade}</strong>.</p>`;
      return;
    }

    let html = `<p>📰 Últimas notícias sobre alagamentos em <strong>${cidade}</strong>:</p>`;
    dados.noticias.forEach(noticia => {
      html += `
        <div class="noticia">
          <a href="${noticia.link}" target="_blank"><strong>${noticia.titulo}</strong></a>
          <p style="font-size: 13px; color: gray;">${noticia.data}</p>
        </div>
      `;
    });

    noticiasDiv.innerHTML = html;
  } catch (erro) {
    noticiasDiv.innerHTML = `<p style="color:red;">❌ Erro ao buscar notícias: ${erro.message}</p>`;
  }
}
