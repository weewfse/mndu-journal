// submit-article.js
// Handles submit article form (mock, no backend)
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('submitArticleForm');
  if (!form) return;
  form.onsubmit = function(e) {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {
      title: formData.get('title'),
      abstract: formData.get('abstract'),
      keywords: formData.get('keywords').split(',').map(s => s.trim()),
      level: formData.get('level'),
      pdf: formData.get('pdf') ? formData.get('pdf').name : ''
    };
    console.log('Submitted article:', data);
    alert('Өгүүлэл амжилттай илгээгдлээ (mock)!');
    form.reset();
  };
});
