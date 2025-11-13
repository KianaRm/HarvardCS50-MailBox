document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  //submit
  document.querySelector("#compose-form").addEventListener('submit', sendEmail)



  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views 
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function view_email(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#email-detail-view').style.display = 'block';

      document.querySelector('#email-detail-view').innerHTML = `
        <ul class="list-group list-group-flush">
          <li class="list-group-item"><strong>From: ${email.sender}</strong></li>
          <li class="list-group-item"><strong>To: ${email.recipients}</strong></li>
          <li class="list-group-item"><strong>Subject: ${email.subject}</strong></li>
          <li class="list-group-item"><strong>Timestamp: ${email.timestamp}</strong></li>
          <li class="list-group-item"><strong>${email.body}</strong></li>
        </ul>
      `

      if(!email.read){
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
      }
    
      
      if (current_mailbox !== "sent"){
        const archive_btn = document.createElement('button');
        archive_btn.innerHTML = email.archived ?"Unarchived" : "Archive";
        archive_btn.className = email.archived ? "btn btn-success ml-3 mt-3" : "btn btn-danger ml-3 mt-3";
        archive_btn.addEventListener('click', function() {
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: !email.archived
            })
          })
          .then(() => load_mailbox('inbox'));
        });
        document.querySelector('#email-detail-view').append(archive_btn);
    
        const reply_btn = document.createElement('button');
        reply_btn.innerHTML = "Reply";
        reply_btn.className = "btn btn-info ml-3 mt-3";
        reply_btn.addEventListener('click', function() {
          compose_email();

          document.querySelector('#compose-recipients').value = email.sender;
          let subject = email.subject;
          if (!subject.startsWith("Re:")) {
            subject = "Re: " + subject;
        }
          document.querySelector('#compose-subject').value = subject;
          document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
        });
        document.querySelector('#email-detail-view').append(reply_btn);
      }
  });
}

function load_mailbox(mailbox) {
  current_mailbox = mailbox;
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      emails.forEach(email => {
        console.log(email);
        const newEmail = document.createElement('div');
        newEmail.className = "list-group-item";
        newEmail.innerHTML = `
           <h5>Sender: ${email.sender}</h5>
           <h5>Subject: ${email.subject}</h5>
           <p>${email.timestamp}</p>
        `;

        newEmail.className = email.read?'read':'unread';


        newEmail.addEventListener('click', function() {
         view_email(email.id)
      });
      document.querySelector('#emails-view').append(newEmail);
      }); 
  });

}

function sendEmail(event){
  event.preventDefault();

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent')
  });

}