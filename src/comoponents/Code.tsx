import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface Props {
  title: string
  value: string
}

export default function Code(props: Props) {
  const { title, value } = props
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography
          style={{ wordWrap: "break-word" }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}
