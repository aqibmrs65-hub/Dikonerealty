/* Dikone Realty — consultation form.
   Sends the request to WhatsApp (Haroon Rasheed or Umesh Nathalal) with the details pre-filled.
   Change the numbers below if a number ever changes (country code first, digits only). */
(function () {
  var RECIPIENTS = {
    haroon: { name: 'Haroon Rasheed', number: '971566276451' },
    umesh: { name: 'Umesh Nathalal', number: '971554602369' }
  };
  var form = document.getElementById('leadForm');
  var status = document.getElementById('formStatus');
  if (!form) return;

  function say(text, link) {
    if (!status) return;
    status.textContent = text;
    if (link) {
      var a = document.createElement('a');
      a.href = link; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = ' Open WhatsApp';
      a.className = 'form-status-link';
      status.appendChild(a);
    }
  }

  form.addEventListener('input', function (e) { e.target.classList.remove('invalid'); });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var required = Array.prototype.slice.call(form.querySelectorAll('[required]'));
    var bad = required.filter(function (f) { return !f.checkValidity(); });
    required.forEach(function (f) { f.classList.toggle('invalid', !f.checkValidity()); });
    if (bad.length) {
      say('Please complete the required fields.');
      bad[0].focus();
      return;
    }

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
    var who = RECIPIENTS[data.recipient] || RECIPIENTS.haroon;

    var lines = [
      'Hello ' + who.name.split(' ')[0] + ', I would like to request a private consultation with Dikone Realty.',
      '',
      'Name: ' + data.name,
      'Phone / WhatsApp: ' + data.phone,
      'Email: ' + data.email
    ];
    if (data.interest) lines.push('Interest: ' + data.interest);
    if (data.budget) lines.push('Budget: ' + data.budget);
    if (data.developer) lines.push('Preferred developer: ' + data.developer);
    if (data.message) lines.push('Message: ' + data.message);

    var url = 'https://wa.me/' + who.number + '?text=' + encodeURIComponent(lines.join('\n'));
    var win = null;
    try { win = window.open(url, '_blank', 'noopener'); } catch (_) {}
    if (win) {
      say('Opening WhatsApp with your message to ' + who.name + '. Press send there to finish.');
    } else {
      say('Your message to ' + who.name + ' is ready.', url);
    }
  });
})();
