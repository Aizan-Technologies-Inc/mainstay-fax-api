const navLinks = Array.from(document.querySelectorAll(".section-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const scope =
  "mainstay-infra-prod-pool-res-server/read mainstay-infra-prod-pool-res-server/write";
const tokenUrl = "https://api.optiqare.com/tokens";

const snippets = {
  tokens: {
    curl: `curl --location '${tokenUrl}' \\
  --header 'Authorization: Basic CLIENT_CREDENTIALS' \\
  --data '{
    "grant_type": "client_credentials",
    "scope": "${scope}"
  }'`,
    ruby: `require "net/http"
require "json"

uri = URI("${tokenUrl}")
request = Net::HTTP::Post.new(uri)
request["Authorization"] = "Basic CLIENT_CREDENTIALS"
request.body = {
  grant_type: "client_credentials",
  scope: "${scope}"
}.to_json

response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
  http.request(request)
end`,
    python: `import requests

response = requests.post(
    "${tokenUrl}",
    headers={"Authorization": "Basic CLIENT_CREDENTIALS"},
    json={
        "grant_type": "client_credentials",
        "scope": "${scope}",
    },
)`,
    php: `<?php
$payload = [
  "grant_type" => "client_credentials",
  "scope" => "${scope}"
];

$ch = curl_init("${tokenUrl}");
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => ["Authorization: Basic CLIENT_CREDENTIALS"],
  CURLOPT_POSTFIELDS => json_encode($payload),
  CURLOPT_RETURNTRANSFER => true
]);

$response = curl_exec($ch);`,
    java: `HttpRequest request = HttpRequest.newBuilder()
  .uri(URI.create("${tokenUrl}"))
  .header("Authorization", "Basic CLIENT_CREDENTIALS")
  .POST(HttpRequest.BodyPublishers.ofString("""
  {
    "grant_type": "client_credentials",
    "scope": "${scope}"
  }
  """))
  .build();`,
    node: `const response = await fetch("${tokenUrl}", {
  method: "POST",
  headers: {
    Authorization: "Basic CLIENT_CREDENTIALS"
  },
  body: JSON.stringify({
    grant_type: "client_credentials",
    scope: "${scope}"
  })
});`,
    go: `payload := strings.NewReader(\`{
  "grant_type": "client_credentials",
  "scope": "${scope}"
}\`)

req, _ := http.NewRequest("POST", "${tokenUrl}", payload)
req.Header.Add("Authorization", "Basic CLIENT_CREDENTIALS")`,
    dotnet: `using var client = new HttpClient();

using var request = new HttpRequestMessage(HttpMethod.Post, "${tokenUrl}");
request.Headers.Add("Authorization", "Basic CLIENT_CREDENTIALS");
request.Content = JsonContent.Create(new {
  grant_type = "client_credentials",
  scope = "${scope}"
});

using var response = await client.SendAsync(request);`
  }
};

const responseSnippets = {
  tokens: {
    200: `{
  "access_token": "eyJraWQiO...",
  "expires_in": 3600,
  "token_type": "Bearer"
}`,
    429: `Too Many Requests.`,
    500: `Internal error.`
  }
};

if (sections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) {
        return;
      }

      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    {
      rootMargin: "-20% 0px -60% 0px",
      threshold: [0.1, 0.25, 0.5]
    }
  );

  sections.forEach((section) => observer.observe(section));
}

document.querySelector("#section-search").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();

  navLinks.forEach((link) => {
    const matches = !query || link.textContent.toLowerCase().includes(query);
    link.hidden = !matches;
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }

  const activeTag = document.activeElement?.tagName;
  if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") {
    return;
  }

  event.preventDefault();
  document.querySelector("#section-search").focus();
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copy);

    if (!target) {
      return;
    }

    const originalLabel = button.textContent;
    const text = target.textContent;

    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = originalLabel;
      }, 1100);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(target);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
});

function setLanguage(snippetKey, language) {
  const snippet = snippets[snippetKey]?.[language];
  const pre = document.querySelector(`[data-snippet="${snippetKey}"] pre`);
  const select = document.querySelector(`[data-language-select="${snippetKey}"]`);

  if (!snippet || !pre) {
    return;
  }

  pre.textContent = snippet;

  if (select) {
    select.value = language;
  }

  document.querySelectorAll(`[data-language-tab="${snippetKey}"]`).forEach((button) => {
    button.classList.toggle("is-active", button.dataset.language === language);
  });
}

document.querySelectorAll("[data-language-select]").forEach((select) => {
  select.addEventListener("change", () => {
    setLanguage(select.dataset.languageSelect, select.value);
  });
});

document.querySelectorAll("[data-language-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.languageTab, button.dataset.language);
  });
});

Object.keys(snippets).forEach((snippetKey) => setLanguage(snippetKey, "curl"));

function setResponseCode(responseKey, code) {
  const snippet = responseSnippets[responseKey]?.[code];
  const output = document.querySelector(`[data-response-output="${responseKey}"]`);

  if (!snippet || !output) {
    return;
  }

  output.textContent = snippet;

  document.querySelectorAll(`[data-response-tab="${responseKey}"]`).forEach((button) => {
    button.classList.toggle("is-active", button.dataset.responseCode === String(code));
  });
}

document.querySelectorAll("[data-response-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    setResponseCode(button.dataset.responseTab, button.dataset.responseCode);
  });
});

Object.keys(responseSnippets).forEach((responseKey) => setResponseCode(responseKey, "200"));
