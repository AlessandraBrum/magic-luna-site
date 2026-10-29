# 🌙 Magic Luna

Magic Luna is a downloadable app that converts PNG images to WebP, right on your computer. ✨

This repository is the Magic Luna website (landing page).

- [Download for Windows](https://github.com/AlessandraBrum/magic-luna-image-converter/releases/latest/download/MagicLuna.exe)
- [App source code](https://github.com/AlessandraBrum/magic-luna-image-converter)
- [Release notes](https://github.com/AlessandraBrum/magic-luna-image-converter/releases)

<img width="644" height="633" alt="Magic Luna app screenshot: dark purple window with a pink to purple moon and stars logo, a file panel and a purple Convert to WebP button" src="https://github.com/user-attachments/assets/456b622e-342c-4ccc-9737-56f9ba8790c3" />

## ⚠️ About the Windows security warning

Magic Luna is a small independent app and is not digitally signed yet. Because of this, Windows and your browser may show a warning the first time. This is expected and does not mean the app is harmful.

**If your browser says the file "isn't commonly downloaded":**
click the three dots next to the download and choose **Keep**.

**If Windows shows "Windows protected your PC":**
1. Click **More info**.
2. Click **Run anyway**.

You only need to do this once.

Magic Luna runs 100% on your computer: it does not connect to the internet and your images never leave your device. The full source code is open in the [app repository](https://github.com/AlessandraBrum/magic-luna-image-converter), so anyone can check what it does.

## ⚠️ Sobre o aviso de segurança do Windows

O Magic Luna é um app independente e ainda não tem assinatura digital. Por isso, o Windows e o navegador podem mostrar um aviso na primeira vez. Isso é esperado e não significa que o app seja perigoso.

**Se o navegador disser que o arquivo "não é baixado com frequência":**
clique nos três pontinhos ao lado do download e escolha **Manter**.

**Se o Windows mostrar "O Windows protegeu o computador":**
1. Clique em **Mais informações**.
2. Clique em **Executar assim mesmo**.

Você só precisa fazer isso uma vez.

O Magic Luna funciona 100% no seu computador: ele não se conecta à internet e suas imagens nunca saem do seu dispositivo. O código-fonte completo está aberto no [repositório do app](https://github.com/AlessandraBrum/magic-luna-image-converter), então qualquer pessoa pode conferir o que ele faz.

## Website privacy

This website has no analytics and no ads. Fonts and images are served from this repository, and a Content Security Policy blocks any outside script, except Google Translate. The page opens in English, and Google Translate is only loaded when the visitor clicks "Português". From then on, Google receives the page text to translate it and saves its own `googtrans` cookie with that choice. The animation choice is saved only in the visitor's own browser (localStorage).

## Accessibility

- WCAG 2.2 AAA color contrast (7:1 or more for text).
- Full keyboard navigation, visible focus and a "Skip to content" link.
- Text at 16 px or larger, touch targets at 44 px or larger.
- Respects the system "reduce motion" setting, plus a button to turn animations off.
- English by default, with a button that translates the page to Portuguese with Google Translate.

## Run website locally

Open the folder in VS Code and start Live Server or Live Preview on `index.html`. Google Translate does not work when the file is opened directly (`file://`).

## Structure

```
index.html          page content (English is the main language)
css/estilos.css     styles, mobile first
js/script.js        translation, animations, menu, stars, FAQ and back-to-top
assets/fonts/       Playfair Display and Atkinson Hyperlegible (SIL Open Font License)
assets/img/         app screenshot and favicon
```

## Credits

Design and development by [Alessandra Brum](https://www.alessandrabrum.com).
Fonts: Playfair Display (Claus Eggers Sørensen) and Atkinson Hyperlegible (Braille Institute), both under the SIL Open Font License 1.1.

© 2026 Alessandra Brum. Code under the MIT License; name, logo and images all rights reserved. See [LICENSE](LICENSE).
