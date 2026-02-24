import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../src/app'
import { FastifyInstance } from 'fastify'

describe('Vehicle APIs', () => {
  let app: FastifyInstance
  
  beforeAll(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /api/vehicles should return an array', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/vehicles'
    })
    
    expect(response.statusCode).toBe(200)
    const json = response.json()
    expect(Array.isArray(json)).toBe(true)
  })

  it('POST /api/vehicles should create a vehicle', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/vehicles',
      payload: {
        id: 'TEST_TRUCK_001',
        kind: 'TRUCK',
        brand: 'TestBrand',
        nbWheels: 6
      }
    })
    
    // 201 Created
    if(response.statusCode === 500 || response.statusCode === 400) {
      console.log('Error output: ', response.json());
    }
    
    expect(response.statusCode).toBe(201)
    expect(response.json().id).toBe('TEST_TRUCK_001')
  })

  it('DELETE /api/vehicles should remove a vehicle', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/vehicles/TEST_TRUCK_001'
    })
    
    expect(response.statusCode).toBe(200)
  })
})
