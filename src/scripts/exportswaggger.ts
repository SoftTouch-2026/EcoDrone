import fs from 'fs'
import path from 'path'
import { swaggerSpec } from '../index'

const exportSwaggerSpec = () => {
    try {
        // Create the output directory if it doesn't exist
        const outputDir = path.join(process.cwd(), 'swagger')
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir)
        }

        // Write the swagger spec to a JSON file
        const outputPath = path.join(outputDir, 'swagger.json')
        fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2))

        console.log(`Swagger specification exported to ${outputPath}`)
    } catch (error) {
        console.error('Error exporting Swagger specification:', error)
        process.exit(1)
    }
}

exportSwaggerSpec()
