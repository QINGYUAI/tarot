/** 最先加载环境变量，确保 logger 等模块能读取 .env */
import dotenv from 'dotenv'

dotenv.config()
