const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://bchehzelzcbzrsitliuy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaGVoemVsemNienJzaXRsaXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTg1NTcsImV4cCI6MjA5MjM5NDU1N30.lKZrKYaYhdI6uoCpuAo5fHn2f9iSAPZXOAEqH4w6Cxc'
)

module.exports = supabase
