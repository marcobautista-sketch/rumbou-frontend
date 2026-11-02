import { StyleSheet, View } from 'react-native'
import type { QuestionPresentation } from '../types/presentation'
import { MathText } from './MathText'
import { QuestionFigure } from './QuestionFigure'

interface QuestionStatementProps {
  question: { enunciado: string; presentacion?: QuestionPresentation | null }
  fontSize?: number
}

// El enunciado con sus fórmulas y, si la pregunta la tiene, su figura debajo.
export function QuestionStatement({ question, fontSize = 17 }: QuestionStatementProps) {
  const figure = question.presentacion?.figura
  return (
    <View style={styles.statement}>
      <MathText
        text={question.presentacion?.enunciado}
        fallback={question.enunciado}
        fontSize={fontSize}
      />
      {figure && <QuestionFigure figure={figure} />}
    </View>
  )
}

const styles = StyleSheet.create({
  statement: { gap: 12 },
})
