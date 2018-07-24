const dedent = require('dedent')

module.exports = ({
  first_name
}) => ({
  subject: 'How to hire the best talent from your employees networks',
  html: dedent`
    ${first_name ? `Hi ${first_name}` : 'Hey'},
    <br />
    <br />
    I hope you don’t mind me reaching out. I’m the founder of <a href="https://nudj.co/?utm_source=sales&utm_medium=email&utm_campaign=1507&utm_term=marcos">nudj</a>, a peer-to-peer hiring platform powered by referrals. Companies like Mr&Mrs Smith, Charlotte Tilbury and Me&Em use nudj to help maximise the success of their referral schemes.
    <br />
    <br />
    Referrals are a great source of candidates but effective referral schemes are notoriously tricky to implement and that’s where nudj steps in. We strip out all the hassle of asking for, tracking and sourcing referrals from your company’s network.
    <br />
    <br />
    Smart matching and 2-click referrals make it easy for your team to reach out to their network and our curated community of super connectors extends the reach of your role. Diversifying the pool of referred talent you get introduced to.
    <br />
    <br />
    The result is a low volume of high quality candidates trickled into your ATS. Candidates sourced via the nudj platform have an 80% interview rate and the average cost of hire is 50% cheaper than a recruiter. Saving you time to focus on developing and not finding your team.
    <br />
    <br />
    Join 100s of other companies already using nudj to tap into hidden talent pools <a href="https://nudj.co/?utm_source=sales&utm_medium=email&utm_campaign=1507&utm_term=marcos">here</a> or let me know if you have any questions.
    <br />
    <br />
    Best,
    <br />
    <br />
    Robyn
  `
})
