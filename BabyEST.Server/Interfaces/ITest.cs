namespace BabyEST.Server.Interfaces;

public interface ITest
{
	int Do();
}

public class Test : ITest
{
	public int Do() => 1;
}