const { Prisma } = require('@prisma/client')

async function main() {
  console.log('--- DB Engine Metadata Audit ---')
  const model = Prisma.dmmf.datamodel.models.find(m => m.name === 'Department')
  
  if (!model) {
    console.error('ERROR: Department model not found in DMMF!')
    return
  }

  console.log('Department Model Fields:')
  model.fields.forEach(f => {
    console.log(` - ${f.name} (${f.type}) ${f.isRequired ? '[REQUIRED]' : ''}`)
  })
}

main()
