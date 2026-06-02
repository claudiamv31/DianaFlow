using System.ComponentModel.DataAnnotations.Schema;
using backend.Modulos.Cycles.Enums;

namespace backend.Modulos.Cycles.Enums
{
    public class PhaseMessages
    {
        public int Id { get; set; }
        public ECyclePhase Phase { get; set; }
        public string? Message { get; set; }
        public EPhaseMessageType MessageType { get; set; } = EPhaseMessageType.Short;
    }
}