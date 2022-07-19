import { Typography } from 'antd'
const { Paragraph, Link } = Typography

export default function Info () {
  return (
    <center>
      <Paragraph>Areou you interested in example project for some of your Ideas?</Paragraph>
      <Paragraph>Add an idea yourself or upvote an existing one. Some ideas will be converted into example projects with tutorials at <Link href='https://blog.vechain.energy' target='_blank' rel='noreferrer'>blog.vechain.energy</Link></Paragraph>
    </center>
  )
}
