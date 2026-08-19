import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Certificate from '@/models/Certificate'

// GET - Get certificate by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await connectToDatabase()
    
    const certificate = await Certificate.findById(id)

    if (!certificate) {
      return NextResponse.json(
        { success: false, message: 'Certificate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate._id,
        certificateNumber: certificate.certificateNumber,
        name: certificate.name,
        product: certificate.product,
        email: certificate.email,
        date: certificate.date,
        status: certificate.status,
        downloadCount: certificate.downloadCount,
        shareCount: certificate.shareCount,
        createdAt: certificate.createdAt
      }
    })
  } catch (error) {
    console.error('Error fetching certificate:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch certificate' },
      { status: 500 }
    )
  }
}

// PUT - Update certificate (download/share tracking)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await req.json()
    const { action, imageData } = data

    await connectToDatabase()
    
    const certificate = await Certificate.findById(id)

    if (!certificate) {
      return NextResponse.json(
        { success: false, message: 'Certificate not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {
      lastAccessed: new Date()
    }

    if (action === 'download') {
      updateData.downloadCount = (certificate.downloadCount || 0) + 1
      updateData.status = 'downloaded'
    } else if (action === 'share') {
      updateData.shareCount = (certificate.shareCount || 0) + 1
      updateData.status = 'shared'
    }

    if (imageData) {
      updateData.imageData = imageData
    }

    const updatedCertificate = await Certificate.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )

    if (!updatedCertificate) {
      return NextResponse.json(
        { success: false, message: 'Failed to update certificate' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      certificate: {
        id: updatedCertificate._id,
        certificateNumber: updatedCertificate.certificateNumber,
        name: updatedCertificate.name,
        product: updatedCertificate.product,
        email: updatedCertificate.email,
        date: updatedCertificate.date,
        status: updatedCertificate.status,
        downloadCount: updatedCertificate.downloadCount,
        shareCount: updatedCertificate.shareCount,
        createdAt: updatedCertificate.createdAt
      }
    })
  } catch (error) {
    console.error('Error updating certificate:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update certificate' },
      { status: 500 }
    )
  }
}

// DELETE - Delete certificate
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await connectToDatabase()
    
    const certificate = await Certificate.findByIdAndDelete(id)

    if (!certificate) {
      return NextResponse.json(
        { success: false, message: 'Certificate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Certificate deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting certificate:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete certificate' },
      { status: 500 }
    )
  }
}
