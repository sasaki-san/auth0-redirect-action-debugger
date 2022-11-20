import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CodeTextField from './CodeTextField';

interface Props {
  title: string
  value: string
  editable?: boolean
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const EditableCard = (props: Props) => {
  return (
    <CodeTextField
      id="outlined-multiline-flexible"
      fullWidth
      multiline
      label={props.title}
      onChange={props.onChange}
      maxRows={10}
      value={props.value}
    />
  )
}

const NonEditableCard = (props: Props) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {props.title}
        </Typography>
        <Typography
          style={{ wordWrap: "break-word" }}
          fontFamily='"Roboto Mono"'
        >
          {props.value}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default function Code(props: Props) {
  const { editable = false } = props
  return (
    editable ? <EditableCard {...props} /> : <NonEditableCard {...props} />
  )
}
