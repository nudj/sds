const dedent = require('dedent')

module.exports = ({
  first_name,
  hash,
  campaign
}) => ({
  subject: 'The secret to hiring the best talent',
  html: dedent`
    ${first_name ? `Hi ${first_name}` : 'Hey'},
    <br />
    <br />
    I hope you don’t mind me reaching out? I’m the founder of <a href="https://nudj.co/?utm_source=sales&utm_medium=email&utm_campaign=${campaign}&utm_term=marcos&m=${hash}">nudj</a>, a peer-to-peer hiring platform powered by referrals. Companies like Mr&Mrs Smith, Charlotte Tilbury and Me&Em use nudj to help maximise the success of their referral schemes.
    <br />
    <br />
    Referrals are a great source of hire but effective referral schemes are notoriously tricky to implement and that’s where nudj steps in. We strip out all the hassle of asking for, tracking and sourcing referrals from your company’s network.
    <br />
    <br />
    The result is a low volume of high quality candidates trickled into your ATS. Candidates sourced via the nudj platform have an 80% interview rate and the average cost of hire is 50% cheaper than a recruiter, saving you time to focus on developing and not finding your team.
    <br />
    <br />
    I understand the budget might not be there to trial new software this late in the year, so we're offering a free trial until December 31st to companies signing up before September 1st (no credit card required). You can get started <a href="https://nudj.co/?utm_source=sales&utm_medium=email&utm_campaign=${campaign}&utm_term=marcos&m=${hash}">here</a> or let me know if you have any questions.
    <br />
    <br />
    Thanks,
    <br />
    <br />
    Robyn
    <br />
    <br />
    --
    <br />
    <br />
    Robyn McGirl
    <br />
    </br>
    Founder
    <br />
    07920549291
    <br />
    <br/>
    <div>
      <img src="https://drive.google.com/a/nudj.co/uc?id=0B0LAdd0A8p4jZWtEdjFfWW15NTg" width="96" height="96" />
      <br />
      <br />
      <small>If you don't want to hear any more about nudj, reply to this email and let me know</small>
    </div>
  `
})
